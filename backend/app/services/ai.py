import google.generativeai as genai
from typing import Dict, Any, List
import os
import logging

logger = logging.getLogger(__name__)

class AIProvider:
    def __init__(self, api_key: str = None):
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-pro')
        else:
            self.model = None

    def generate_insights(self, repo_data: Dict[str, Any]) -> str:
        """
        Generate natural language insights from repository data.
        """
        if not self.model:
            return "AI Insights are currently unavailable. Please configure an API key."

        prompt = f"""
        Analyze the following GitHub repository metadata and provide a concise, professional summary 
        of the repository's health, productivity trends, and any potential risks.
        
        Repository: {repo_data.get('full_name')}
        Stars: {repo_data.get('stars')}
        Forks: {repo_data.get('forks')}
        Open Issues: {repo_data.get('open_issues')}
        Language: {repo_data.get('language')}
        
        Commit Frequency (last 30 days): {repo_data.get('commit_frequency')}
        PR Stats: {repo_data.get('pr_stats')}
        Language Breakdown: {repo_data.get('language_breakdown')}
        
        Provide your response in 3 bullet points:
        1. Health Overview (Commit velocity & stability)
        2. Productivity Trend (PR activity & merge velocity)
        3. Risk Detection (Critical areas or maintenance concerns)
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Error generating AI insights: {e}")
            return "Unable to generate insights at this time."

    def calculate_health_score(self, repo_data: Dict[str, Any]) -> float:
        """
        Compute a health score (0-100) based on repository metrics.
        """
        score = 50.0 # Base score
        
        # Velocity impact
        commits = repo_data.get('commit_frequency', {})
        if isinstance(commits, dict):
            recent_commits = sum([v for k, v in commits.items() if '202' in k])
            if recent_commits > 20: score += 15
            elif recent_commits > 5: score += 5
            else: score -= 10
            
        # Issues impact
        open_issues = repo_data.get('open_issues', 0)
        stars = repo_data.get('stars', 1)
        # Ratio issues / stars (capped to avoid extreme skew)
        ratio = open_issues / (stars if stars > 0 else 1)
        if ratio < 0.1: score += 10
        elif ratio > 0.5: score -= 10
        
        # PR Impact
        pr_stats = repo_data.get('pr_stats', {})
        if pr_stats.get('merged', 0) > pr_stats.get('open', 0):
            score += 15
        elif pr_stats.get('open', 0) > 10:
            score -= 5
            
        return max(0.0, min(100.0, score))
