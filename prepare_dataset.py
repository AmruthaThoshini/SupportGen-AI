
from datasets import load_dataset
import pandas as pd

# Load the dataset
ds = load_dataset(
    "bitext/Bitext-customer-support-llm-chatbot-training-dataset"
)

df = ds["train"].to_pandas()

# Basic dataset inspection
print("Dataset shape:", df.shape)

print("\nMissing values:")
print(df.isnull().sum())

print("\nDuplicate rows:", df.duplicated().sum())

print("\nNumber of categories:", df["category"].nunique())
print("\nCategory counts:")
print(df["category"].value_counts())

print("\nNumber of intents:", df["intent"].nunique())
print("\nMost common intents:")
print(df["intent"].value_counts().head(10))
