import logging
import requests
from celery import Celery
from app.config import settings

logger = logging.getLogger(__name__)

# Sanitize Redis URL for Upstash (ensure SSL and no trailing slashes)
redis_url = settings.REDIS_URL.strip().rstrip('/')
if redis_url.startswith("redis://") and "upstash.io" in redis_url:
    redis_url = redis_url.replace("redis://", "rediss://", 1)

celery = Celery(
    "gitlytics",
    broker=f"{redis_url}?ssl_cert_reqs=none",
    backend=f"{redis_url}?ssl_cert_reqs=none",
)

celery.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
)


@celery.task(bind=True, name="analyze_repository")
def analyze_repository(self, repo_id: int, access_token: str):
    """Synchronous Celery task for repository analysis with AI insights."""
    from app.database import SessionLocal
    from app.models.repository import Repository, RepoAnalysis
    from app.services.analytics import AnalyticsService
    from app.services.ai import AIProvider
    from datetime import datetime, timedelta
    import os

    self.update_state(state="STARTED", meta={"progress": 10, "step": "Fetching repository"})

    headers = {
        "Authorization": f"token {access_token}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Gitlytics/1.0",
    }
    GITHUB_API = "https://api.github.com"

    # Initialize AI Provider
    ai = AIProvider(api_key=settings.GEMINI_API_KEY)

    with SessionLocal() as db:
        repo = db.get(Repository, repo_id)
        if not repo:
            return {"error": "Repository not found"}

        full_name = repo.full_name

        # 1. Fetch Commits
        self.update_state(state="STARTED", meta={"progress": 20, "step": "Fetching commits"})
        since = (datetime.utcnow() - timedelta(days=365)).isoformat() + "Z"
        commits = []
        url = f"{GITHUB_API}/repos/{full_name}/commits"
        params = {"since": since, "per_page": 100}
        while url:
            r = requests.get(url, headers=headers, params=params, timeout=60)
            if r.status_code in (404, 409):
                break
            r.raise_for_status()
            commits.extend(r.json())
            url = r.links.get("next", {}).get("url")
            params = {}

        # 2. Fetch Languages
        self.update_state(state="STARTED", meta={"progress": 35, "step": "Fetching languages"})
        lr = requests.get(f"{GITHUB_API}/repos/{full_name}/languages", headers=headers, timeout=30)
        languages = lr.json() if lr.status_code == 200 else {}

        # 3. Fetch Issues & PRs
        self.update_state(state="STARTED", meta={"progress": 50, "step": "Fetching issues and PRs"})
        ir_open = requests.get(f"{GITHUB_API}/repos/{full_name}/issues", headers=headers, params={"state": "open", "per_page": 1}, timeout=30)
        ir_closed = requests.get(f"{GITHUB_API}/repos/{full_name}/issues", headers=headers, params={"state": "closed", "per_page": 1}, timeout=30)
        # Handle total count headers if present
        open_issues = int(ir_open.headers.get("x-total-count", 0)) if ir_open.status_code == 200 else 0
        closed_issues = int(ir_closed.headers.get("x-total-count", 0)) if ir_closed.status_code == 200 else 0
        
        pr_open = requests.get(f"{GITHUB_API}/repos/{full_name}/pulls", headers=headers, params={"state": "open", "per_page": 1}, timeout=30)
        pr_closed = requests.get(f"{GITHUB_API}/repos/{full_name}/pulls", headers=headers, params={"state": "closed", "per_page": 1}, timeout=30)
        open_prs = int(pr_open.headers.get("x-total-count", 0)) if pr_open.status_code == 200 else 0
        merged_prs = int(pr_closed.headers.get("x-total-count", 0)) if pr_closed.status_code == 200 else 0

        # 4. Fetch Security Alerts
        self.update_state(state="STARTED", meta={"progress": 65, "step": "Fetching security alerts"})
        sr = requests.get(f"{GITHUB_API}/repos/{full_name}/dependabot/alerts", headers=headers, timeout=30)
        security_alerts = sr.json() if sr.status_code == 200 else []

        # 5. Run Analytics & AI
        self.update_state(state="STARTED", meta={"progress": 80, "step": "AI Analysis in progress"})
        commit_data = AnalyticsService.analyze_commits(commits)
        lang_data = AnalyticsService.analyze_languages(languages)
        trend_data = AnalyticsService.compute_trends(repo.stars, repo.forks, repo.watchers, repo.open_issues)
        prediction = AnalyticsService.predict_popularity(
            repo.stars, repo.forks, repo.watchers, commit_data["total_commits"]
        )

        analysis_payload = {
            "full_name": full_name,
            "stars": repo.stars,
            "forks": repo.forks,
            "open_issues": repo.open_issues,
            "language": repo.language,
            "commit_frequency": commit_data["commit_frequency"],
            "pr_stats": {"open": open_prs, "merged": merged_prs},
            "language_breakdown": lang_data["breakdown"]
        }
        
        health_score = ai.calculate_health_score(analysis_payload)
        
        # Run AI Summary (Now truly synchronous)
        try:
            ai_summary = ai.generate_insights(analysis_payload)
        except Exception as e:
            logger.error(f"AI generation failed: {e}")
            ai_summary = "AI Insights generation failed."

        # 6. Save results
        analysis = db.query(RepoAnalysis).filter(RepoAnalysis.repository_id == repo_id).first()
        if not analysis:
            analysis = RepoAnalysis(repository_id=repo_id)
            db.add(analysis)

        analysis.commit_frequency = commit_data["commit_frequency"]
        analysis.top_contributors = commit_data["top_contributors"]
        analysis.language_breakdown = lang_data["breakdown"]
        analysis.issues_ratio = round(open_issues / (open_issues + closed_issues), 4) if (open_issues + closed_issues) > 0 else 0
        analysis.pr_stats = {"open": open_prs, "merged": merged_prs}
        analysis.stars_trend = trend_data
        analysis.popularity_score = prediction["predicted_score"]
        analysis.health_score = health_score
        analysis.security_alerts = security_alerts
        analysis.developer_metrics = {
            "total_commits": commit_data["total_commits"],
            "unique_contributors": len(commit_data["top_contributors"])
        }
        analysis.ai_summary = ai_summary

        db.commit()

        return {
            "repo_id": repo_id,
            "health_score": health_score,
            "ai_summary": ai_summary,
            "progress": 100
        }