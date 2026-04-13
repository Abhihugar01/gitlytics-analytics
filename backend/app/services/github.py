import httpx
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

GITHUB_API = "https://api.github.com"


class GitHubService:
    def __init__(self, access_token: str):
        self.access_token = access_token
        self.headers = {
            "Authorization": f"token {access_token}",
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "Gitlytics/1.0",
        }

    async def get_current_user(self) -> Dict:
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.get(f"{GITHUB_API}/user", headers=self.headers)
            r.raise_for_status()
            return r.json()

    async def get_user_repos(self) -> List[Dict[str, Any]]:
        async with httpx.AsyncClient(timeout=30.0) as client:
            repos: List[Dict] = []
            url = f"{GITHUB_API}/user/repos"
            params = {"per_page": 100, "sort": "updated"}
            while url:
                r = await client.get(url, headers=self.headers, params=params)
                r.raise_for_status()
                repos.extend(r.json())
                url = r.links.get("next", {}).get("url")
                params = {}
            return repos

    async def get_repo_commits(self, full_name: str, days: int = 365) -> List[Dict]:
        from datetime import datetime, timedelta
        since = (datetime.utcnow() - timedelta(days=days)).isoformat() + "Z"
        async with httpx.AsyncClient(timeout=60.0) as client:
            commits: List[Dict] = []
            url = f"{GITHUB_API}/repos/{full_name}/commits"
            params = {"since": since, "per_page": 100}
            while url:
                r = await client.get(url, headers=self.headers, params=params)
                if r.status_code in (409, 404):
                    break
                r.raise_for_status()
                commits.extend(r.json())
                url = r.links.get("next", {}).get("url")
                params = {}
            return commits

    async def get_repo_languages(self, full_name: str) -> Dict[str, int]:
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.get(f"{GITHUB_API}/repos/{full_name}/languages", headers=self.headers)
            return r.json() if r.status_code == 200 else {}

    async def get_repo_contributors(self, full_name: str) -> List[Dict]:
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.get(f"{GITHUB_API}/repos/{full_name}/contributors", headers=self.headers, params={"per_page": 20})
            return r.json() if r.status_code == 200 else []

    async def get_repo_issues(self, full_name: str) -> Dict:
        async with httpx.AsyncClient(timeout=30.0) as client:
            open_r = await client.get(
                f"{GITHUB_API}/repos/{full_name}/issues",
                headers=self.headers,
                params={"state": "open", "per_page": 1}
            )
            closed_r = await client.get(
                f"{GITHUB_API}/repos/{full_name}/issues",
                headers=self.headers,
                params={"state": "closed", "per_page": 1}
            )
            open_count = int(open_r.headers.get("x-total-count", 0)) if open_r.status_code == 200 else 0
            closed_count = int(closed_r.headers.get("x-total-count", 0)) if closed_r.status_code == 200 else 0
            return {"open": open_count, "closed": closed_count}

    async def get_repo_pull_requests(self, full_name: str) -> Dict:
        async with httpx.AsyncClient(timeout=30.0) as client:
            open_r = await client.get(
                f"{GITHUB_API}/repos/{full_name}/pulls",
                headers=self.headers,
                params={"state": "open", "per_page": 1}
            )
            closed_r = await client.get(
                f"{GITHUB_API}/repos/{full_name}/pulls",
                headers=self.headers,
                params={"state": "closed", "per_page": 1}
            )
            open_count = int(open_r.headers.get("x-total-count", 0)) if open_r.status_code == 200 else 0
            closed_count = int(closed_r.headers.get("x-total-count", 0)) if closed_r.status_code == 200 else 0
            return {"open": open_count, "merged": closed_count}

    async def get_user_events(self, username: str) -> List[Dict]:
        """Fetch the latest events for the given user profile."""
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.get(f"{GITHUB_API}/users/{username}/events", headers=self.headers, params={"per_page": 50})
            if r.status_code != 200:
                return []
            return r.json()

    async def get_security_alerts(self, full_name: str) -> List[Dict]:
        """Fetch Dependabot alerts for the repository."""
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Note: This requires 'security_events' scope
            r = await client.get(f"{GITHUB_API}/repos/{full_name}/dependabot/alerts", headers=self.headers)
            if r.status_code == 200:
                return r.json()
            return []

    async def get_org_repos(self, org_name: str) -> List[Dict]:
        """Fetch repositories for a GitHub organization."""
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.get(f"{GITHUB_API}/orgs/{org_name}/repos", headers=self.headers, params={"per_page": 100})
            if r.status_code == 200:
                return r.json()
            return []