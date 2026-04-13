from collections import Counter, defaultdict
from datetime import datetime, timedelta
from typing import Dict, List, Any


class AnalyticsService:

    @staticmethod
    def analyze_commits(commits: List[Dict]) -> Dict[str, Any]:
        dates = []
        authors: Counter = Counter()
        for commit in commits:
            try:
                date_str = commit["commit"]["author"]["date"][:10]
                dates.append(date_str)
                authors[commit["commit"]["author"]["name"]] += 1
            except (KeyError, TypeError):
                continue

        daily_freq: Dict[str, int] = dict(Counter(dates))

        weekly_freq: Dict[str, int] = defaultdict(int)
        for d in dates:
            dt = datetime.strptime(d, "%Y-%m-%d")
            week_start = (dt - timedelta(days=dt.weekday())).strftime("%Y-%m-%d")
            weekly_freq[week_start] += 1

        return {
            "commit_frequency": {
                "daily": daily_freq,
                "weekly": dict(weekly_freq),
            },
            "top_contributors": authors.most_common(10),
            "total_commits": len(commits),
        }

    @staticmethod
    def analyze_languages(languages: Dict[str, int]) -> Dict[str, Any]:
        total = sum(languages.values()) or 1
        breakdown = {lang: round((count / total) * 100, 2) for lang, count in languages.items()}
        dominant = max(languages, key=languages.get) if languages else None
        return {"breakdown": breakdown, "dominant": dominant}

    @staticmethod
    def compute_trends(stars: int, forks: int, watchers: int, open_issues: int) -> Dict:
        score = round(stars * 0.5 + forks * 0.3 + watchers * 0.1 + max(0, 100 - open_issues) * 0.1, 2)
        return {
            "stars": stars,
            "forks": forks,
            "watchers": watchers,
            "open_issues": open_issues,
            "popularity_score": score,
        }

    @staticmethod
    def predict_popularity(stars: int, forks: int, watchers: int, commits: int) -> dict:
        """Simple weighted popularity prediction (no ML deps needed)."""
        try:
            score = stars * 0.5 + forks * 0.3 + watchers * 0.1 + commits * 0.1
            tier = "🔥 Trending" if score > 500 else "🚀 Growing" if score > 100 else "🌱 Emerging"
            return {"predicted_score": round(score, 2), "tier": tier}
        except Exception:
            return {"predicted_score": 0, "tier": "Unknown"}