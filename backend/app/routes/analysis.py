from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.repository import Repository, RepoAnalysis
from app.models.task import TaskStatus, TaskStatusEnum
from app.tasks.analysis import analyze_repository, celery
from celery.result import AsyncResult
import uuid
import json
from io import BytesIO
from fpdf import FPDF

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.post("/{repo_id}")
async def start_repo_analysis(repo_id: int, user_id: int, db: AsyncSession = Depends(get_db)):
    """Kick off async Celery analysis task for a repository."""
    repo = await db.get(Repository, repo_id)
    if not repo or repo.owner_id != user_id:
        raise HTTPException(status_code=404, detail="Repository not found or access denied")

    owner = await db.get(__import__("app.models.user", fromlist=["User"]).User, repo.owner_id)
    access_token = owner.access_token if owner else ""

    # Create placeholder task record
    placeholder_id = str(uuid.uuid4())
    task_record = TaskStatus(
        task_id=placeholder_id,
        user_id=user_id,
        repo_id=repo_id,
        status=TaskStatusEnum.PENDING,
    )
    db.add(task_record)
    await db.commit()

    # Dispatch Celery task
    result = analyze_repository.delay(repo_id, access_token)

    # Update with real task ID
    task_record.task_id = result.id
    await db.commit()

    return {"task_id": result.id, "status": "pending", "message": "Analysis started"}


@router.get("/task/{task_id}")
async def get_task_status(task_id: str):
    """Poll Celery task status and result."""
    task_result = AsyncResult(task_id, app=celery)
    info = task_result.info

    progress = None
    step = None
    if isinstance(info, dict):
        progress = info.get("progress")
        step = info.get("step")

    return {
        "task_id": task_id,
        "status": task_result.status,
        "result": task_result.result if task_result.ready() else None,
        "progress": progress,
        "step": step,
    }


@router.get("/global")
async def get_global_metrics(user_id: int, db: AsyncSession = Depends(get_db)):
    """Aggregate stats across all user repositories."""
    # 1. Basic counts
    repo_result = await db.execute(select(Repository).where(Repository.owner_id == user_id))
    repos = repo_result.scalars().all()
    
    total_stars = sum(r.stars for r in repos)
    total_forks = sum(r.forks for r in repos)
    repo_count = len(repos)

    # 2. Aggregated analysis
    analysis_result = await db.execute(
        select(RepoAnalysis).join(Repository).where(Repository.owner_id == user_id)
    )
    analyses = analysis_result.scalars().all()
    
    avg_popularity = sum(a.popularity_score for a in analyses) / len(analyses) if analyses else 0
    
    # Language aggregate
    global_langs = {}
    for a in analyses:
        if a.language_breakdown:
            for lang, count in a.language_breakdown.items():
                global_langs[lang] = global_langs.get(lang, 0) + count

    return {
        "total_repos": repo_count,
        "total_stars": total_stars,
        "total_forks": total_forks,
        "average_popularity": round(avg_popularity, 2),
        "global_languages": global_langs,
        "rank": "Silver Artisan" if total_stars < 10 else "Gold Architect" if total_stars < 50 else "Platinum Legend"
    }


@router.get("/compare")
async def compare_repos(repo_a: int, repo_b: int, user_id: int, db: AsyncSession = Depends(get_db)):
    """Compare two repositories side-by-side."""
    async def _fetch(rid: int):
        repo = await db.get(Repository, rid)
        if not repo or repo.owner_id != user_id:
            raise HTTPException(status_code=404, detail=f"Repo {rid} not found")
        res = await db.execute(select(RepoAnalysis).where(RepoAnalysis.repository_id == rid))
        a = res.scalar_one_or_none()
        return {
            "repo": {"id": repo.id, "name": repo.name, "stars": repo.stars, "forks": repo.forks},
            "analysis": {"popularity_score": a.popularity_score if a else None, "language_breakdown": a.language_breakdown if a else None},
        }

    return {"repo_a": await _fetch(repo_a), "repo_b": await _fetch(repo_b)}


@router.get("/{repo_id}/insights")
async def get_repo_insights(repo_id: int, user_id: int, db: AsyncSession = Depends(get_db)):
    """Generate smart insights for a repository."""
    res = await db.execute(select(RepoAnalysis).where(RepoAnalysis.repository_id == repo_id))
    a = res.scalar_one_or_none()
    if not a:
        raise HTTPException(status_code=404, detail="Analysis not found")

    insights = []
    
    # Velocity Insight
    commit_history = a.commit_frequency or {}
    total_commits = sum(commit_history.values())
    if total_commits > 50:
        insights.append({"type": "velocity", "text": "High velocity project with consistent momentum.", "trend": "up"})
    else:
        insights.append({"type": "velocity", "text": "Early stage development pace detected.", "trend": "stable"})

    # Community Insight
    if a.popularity_score > 5.0:
        insights.append({"type": "community", "text": "Strong community traction and external interest.", "trend": "up"})
    
    # Maintenance Insight
    pr_data = a.pr_stats or {}
    merged = pr_data.get("merged", 0)
    if merged > 10:
        insights.append({"type": "health", "text": "Healthy PR flow with high merge efficiency.", "trend": "up"})

    return insights


@router.get("/{repo_id}/report")
async def generate_pdf_report(repo_id: int, user_id: int, db: AsyncSession = Depends(get_db)):
    """Generate a PDF audit report for the repository."""
    repo = await db.get(Repository, repo_id)
    res = await db.execute(select(RepoAnalysis).where(RepoAnalysis.repository_id == repo_id))
    a = res.scalar_one_or_none()
    
    if not repo or not a:
        raise HTTPException(status_code=404, detail="Data missing for report")

    pdf = FPDF()
    pdf.add_page()
    
    # Header
    pdf.set_font("helvetica", 'B', 24)
    pdf.cell(0, 20, f"Gitlytics Audit: {repo.name}", ln=True, align='C')
    pdf.set_font("helvetica", '', 12)
    pdf.cell(0, 10, f"Generated for {repo.full_name}", ln=True, align='C')
    pdf.ln(10)

    # Stats
    pdf.set_font("helvetica", 'B', 16)
    pdf.cell(0, 10, "Core Metrics", ln=True)
    pdf.set_font("helvetica", '', 12)
    pdf.cell(0, 8, f"- Stars: {repo.stars}", ln=True)
    pdf.cell(0, 8, f"- Forks: {repo.forks}", ln=True)
    pdf.cell(0, 8, f"- Popularity Score: {a.popularity_score}", ln=True)
    pdf.ln(5)

    # Languages
    pdf.set_font("helvetica", 'B', 16)
    pdf.cell(0, 10, "Technology Stack", ln=True)
    pdf.set_font("helvetica", '', 12)
    if a.language_breakdown:
        for lang, count in a.language_breakdown.items():
            pdf.cell(0, 8, f"- {lang}: {count} bytes", ln=True)
    
    pdf.ln(5)
    pdf.set_font("helvetica", 'I', 10)
    pdf.cell(0, 10, "This report was automatically generated by Gitlytics AI.", align='C')

    try:
        pdf_output = bytes(pdf.output())
        return Response(
            content=pdf_output, 
            media_type="application/pdf", 
            headers={"Content-Disposition": f"attachment; filename=report_{repo_id}.pdf"}
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{repo_id}")
async def get_repo_analysis(repo_id: int, user_id: int, db: AsyncSession = Depends(get_db)):
    """Return stored analysis for a repository."""
    repo = await db.get(Repository, repo_id)
    if not repo or repo.owner_id != user_id:
        raise HTTPException(status_code=404, detail="Repository not found")

    result = await db.execute(select(RepoAnalysis).where(RepoAnalysis.repository_id == repo_id))
    analysis = result.scalar_one_or_none()

    if not analysis:
        raise HTTPException(status_code=404, detail="No analysis found. Start analysis first.")

    return {
        "repo_id": repo_id,
        "commit_frequency": analysis.commit_frequency,
        "top_contributors": analysis.top_contributors,
        "language_breakdown": analysis.language_breakdown,
        "issues_ratio": analysis.issues_ratio,
        "pr_stats": analysis.pr_stats,
        "stars_trend": analysis.stars_trend,
        "popularity_score": analysis.popularity_score,
        "analysis_date": str(analysis.analysis_date),
    }