import logging
import requests
from celery import Celery
from app.config import settings

logger = logging.getLogger(__name__)

celery = Celery(
    "gitlytics",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
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
    """Synchronous Celery task for repository analysis."""
    from app.database import SessionLocal
    from app.models.repository import Repository, RepoAnalysis
    from app.services.analytics import AnalyticsService
    from datetime import datetime, timedelta

    self.update_state(state="STARTED", meta={"progress": 10, "step": "Fetching repository"})

    headers = {
        "Authorization": f"token {access_token}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Gitlytics/1.0",
    }
    GITHUB_API = "https://api.github.com"

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
        self.update_state(state="STARTED", meta={"progress": 40, "step": "Fetching languages"})
        lr = requests.get(f"{GITHUB_API}/repos/{full_name}/languages", headers=headers, timeout=30)
        languages = lr.json() if lr.status_code == 200 else {}

        # 3. Fetch Issues
        self.update_state(state="STARTED", meta={"progress": 55, "step": "Fetching issues"})
        ir_open = requests.get(f"{GITHUB_API}/repos/{full_name}/issues", headers=headers, params={"state": "open", "per_page": 1}, timeout=30)
        ir_closed = requests.get(f"{GITHUB_API}/repos/{full_name}/issues", headers=headers, params={"state": "closed", "per_page": 1}, timeout=30)
        open_issues = int(ir_open.headers.get("x-total-count", 0)) if ir_open.status_code == 200 else 0
        closed_issues = int(ir_closed.headers.get("x-total-count", 0)) if ir_closed.status_code == 200 else 0
        issues = {"open": open_issues, "closed": closed_issues}

        # 4. Fetch PRs
        self.update_state(state="STARTED", meta={"progress": 70, "step": "Fetching PRs"})
        pr_open = requests.get(f"{GITHUB_API}/repos/{full_name}/pulls", headers=headers, params={"state": "open", "per_page": 1}, timeout=30)
        pr_closed = requests.get(f"{GITHUB_API}/repos/{full_name}/pulls", headers=headers, params={"state": "closed", "per_page": 1}, timeout=30)
        open_prs = int(pr_open.headers.get("x-total-count", 0)) if pr_open.status_code == 200 else 0
        closed_prs = int(pr_closed.headers.get("x-total-count", 0)) if pr_closed.status_code == 200 else 0
        prs = {"open": open_prs, "merged": closed_prs}

        # 5. Run Analytics
        self.update_state(state="STARTED", meta={"progress": 85, "step": "Computing analytics"})
        commit_data = AnalyticsService.analyze_commits(commits)
        lang_data = AnalyticsService.analyze_languages(languages)
        trend_data = AnalyticsService.compute_trends(repo.stars, repo.forks, repo.watchers, repo.open_issues)
        prediction = AnalyticsService.predict_popularity(
            repo.stars, repo.forks, repo.watchers, commit_data["total_commits"]
        )

        total_issues = issues["open"] + issues["closed"]
        issues_ratio = round(issues["open"] / total_issues, 4) if total_issues > 0 else 0

        # 6. Save results
        analysis = db.query(RepoAnalysis).filter(RepoAnalysis.repository_id == repo_id).first()
        if analysis:
            analysis.commit_frequency = commit_data["commit_frequency"]
            analysis.top_contributors = commit_data["top_contributors"]
            analysis.language_breakdown = lang_data["breakdown"]
            analysis.issues_ratio = issues_ratio
            analysis.pr_stats = prs
            analysis.stars_trend = trend_data
            analysis.popularity_score = prediction["predicted_score"]
        else:
            analysis = RepoAnalysis(
                repository_id=repo_id,
                commit_frequency=commit_data["commit_frequency"],
                top_contributors=commit_data["top_contributors"],
                language_breakdown=lang_data["breakdown"],
                issues_ratio=issues_ratio,
                pr_stats=prs,
                stars_trend=trend_data,
                popularity_score=prediction["predicted_score"],
            )
            db.add(analysis)

        db.commit()

        return {
            "repo_id": repo_id,
            "full_name": full_name,
            "commit_frequency": commit_data["commit_frequency"],
            "top_contributors": commit_data["top_contributors"],
            "total_commits": commit_data["total_commits"],
            "language_breakdown": lang_data,
            "issues": issues,
            "issues_ratio": issues_ratio,
            "pr_stats": prs,
            "stars_trend": trend_data,
            "prediction": prediction,
        }