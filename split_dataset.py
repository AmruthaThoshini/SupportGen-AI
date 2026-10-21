
from datasets import load_dataset
from sklearn.model_selection import train_test_split
import pandas as pd
from pathlib import Path

# Load the customer support dataset
dataset = load_dataset(
    "bitext/Bitext-customer-support-llm-chatbot-training-dataset"
)

df = dataset["train"].to_pandas()

# Keep the columns needed for our project
df = df[["instruction", "category", "intent", "response"]]

# Split into training (80%) and temporary data (20%)
train_df, temp_df = train_test_split(
    df,
    test_size=0.20,
    random_state=42,
    stratify=df["intent"]
)

# Split the remaining data equally into validation and test sets
val_df, test_df = train_test_split(
    temp_df,
    test_size=0.50,
    random_state=42,
    stratify=temp_df["intent"]
)

# Create the output folder
output_dir = Path("data/processed")
output_dir.mkdir(parents=True, exist_ok=True)

# Save the three datasets
train_df.to_csv(output_dir / "train.csv", index=False)
val_df.to_csv(output_dir / "validation.csv", index=False)
test_df.to_csv(output_dir / "test.csv", index=False)

print("Dataset splitting completed!")
print("Training examples:", len(train_df))
print("Validation examples:", len(val_df))
print("Testing examples:", len(test_df))
print("Total examples:", len(train_df) + len(val_df) + len(test_df))
print("Saved files to:", output_dir.resolve())
