# utils/constants.py

from utils.token_utils import count_tokens
from utils.token_config import get_token_policy
from prompts.readme_templates import build_summary_prompt, build_prompt_from_functional_specs

def get_token_constants(llm_type: str = "gemma"):
    policy = get_token_policy(llm_type)

    summary_template = build_summary_prompt("")
    readme_template = build_prompt_from_functional_specs("")

    return {
        "SUMMARY_TEMPLATE_TOKENS": count_tokens(summary_template, llm_type),
        "README_TEMPLATE_TOKENS": count_tokens(readme_template, llm_type),
        "MAX_CONTEXT_TOKENS": policy["context"],
        "MIN_COMPLETION_TOKENS": policy["min_completion"],
        "SAFETY_MARGIN_TOKENS": policy["safety"],
        "SAFE_CONTEXT_TOKENS": policy["context"] - policy["safety"],
    }

