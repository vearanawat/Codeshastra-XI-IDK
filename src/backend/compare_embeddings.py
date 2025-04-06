from langchain_community.embeddings import HuggingFaceEmbeddings
import numpy as np
from typing import List, Tuple

def calculate_cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """Calculate cosine similarity between two vectors."""
    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

def calculate_euclidean_distance(vec1: List[float], vec2: List[float]) -> float:
    """Calculate Euclidean distance between two vectors."""
    return np.linalg.norm(np.array(vec1) - np.array(vec2))

def compare_word_pairs(embeddings: HuggingFaceEmbeddings, word_pairs: List[Tuple[str, str]]) -> None:
    """Compare multiple word pairs using various similarity metrics."""
    print(f"Embedding dimension: {len(embeddings.embed_query('test'))}\n")
    
    for word1, word2 in word_pairs:
        vec1 = embeddings.embed_query(word1)
        vec2 = embeddings.embed_query(word2)
        
        cos_sim = calculate_cosine_similarity(vec1, vec2)
        euc_dist = calculate_euclidean_distance(vec1, vec2)
        
        print(f"Comparison: '{word1}' vs '{word2}'")
        print(f"Cosine similarity: {cos_sim:.4f}")
        print(f"Euclidean distance: {euc_dist:.4f}")
        print("-" * 50)

def main():
    # Initialize embeddings
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    
    # Define role-related word pairs to compare
    word_pairs = [
        ("admin", "manager"),
        ("contractor", "intern"),
        ("common", "admin"),
        ("policy", "procedure"),
        ("task", "responsibility"),
        ("access", "permission")
    ]
    
    # Compare the word pairs
    compare_word_pairs(embeddings, word_pairs)
    
    # Example of single pair comparison
    print("\nSingle pair detailed comparison:")
    word1, word2 = "admin", "manager"
    vec1 = embeddings.embed_query(word1)
    vec2 = embeddings.embed_query(word2)
    
    print(f"\nVector length: {len(vec1)} dimensions")
    print(f"Cosine similarity between '{word1}' and '{word2}': {calculate_cosine_similarity(vec1, vec2):.4f}")
    print(f"Euclidean distance between '{word1}' and '{word2}': {calculate_euclidean_distance(vec1, vec2):.4f}")

if __name__ == "__main__":
    main()