# SupportGen AI — Fine-Tuned Customer Support Intelligence System

SupportGen AI is an AI-powered customer support assistance system that analyzes customer messages and generates structured support suggestions. It predicts the customer's issue category and intent, then produces a suggested response to help support teams handle customer queries more efficiently.

The project integrates a fine-tuned Large Language Model (LLM) with a Flask API and a web-based dashboard.

> **Project status:** Functional prototype. Model evaluation is preliminary, and inference currently depends on a running Google Colab runtime and an active ngrok tunnel.

## Features

- **Customer message analysis:** Submit a customer support message through the dashboard.
- **Category prediction:** Identify the broad category of the customer's issue.
- **Intent prediction:** Identify the specific intent behind the message.
- **AI-generated suggested replies:** Generate a response that support staff can review and adapt.
- **Recent Activity:** View the latest 20 successful analyses stored in the current browser.
- **Copy suggested reply:** Copy a generated response for further use.
- **Flask REST API:** Connect the frontend to the model inference service.
- **Input validation and error handling:** Handle empty messages, oversized inputs, and prediction failures.

## Technology Stack

| Component | Technology |
|---|---|
| Programming language | Python |
| Frontend | HTML, CSS, JavaScript |
| Backend API | Flask |
| Cross-origin requests | Flask-CORS |
| HTTP communication | Requests |
| Base language model | Qwen2.5-1.5B-Instruct |
| Fine-tuning approach | LoRA parameter-efficient fine-tuning |
| Model inference | Hugging Face Transformers and PEFT |
| Model training environment | Google Colab |
| Temporary API tunnel | ngrok |
| Dataset processing | Pandas and scikit-learn |

## System Architecture

The application uses the following workflow:

1. A user enters a customer message in the web dashboard.
2. The frontend sends the message to the local Flask backend.
3. The Flask backend forwards the request to the model inference API hosted in Google Colab.
4. The fine-tuned model predicts the category, intent, and suggested reply.
5. The result returns through Flask to the frontend.
6. The dashboard displays the prediction and saves the successful analysis to browser-local storage.

```text
Customer
   |
   v
Frontend Dashboard
(HTML, CSS, JavaScript)
   |
   v
Local Flask Backend
   |
   v
ngrok Tunnel
   |
   v
Google Colab Inference API
   |
   v
Qwen2.5-1.5B-Instruct
+ Fine-Tuned LoRA Adapter
   |
   v
Category + Intent + Suggested Reply
   |
   v
Dashboard and Recent Activity
```

## Dataset

The project uses the [Bitext Customer Support LLM Chatbot Training Dataset](https://huggingface.co/datasets/bitext/Bitext-customer-support-llm-chatbot-training-dataset).

The dataset contains customer support instructions, issue categories, intents, and corresponding responses.

### Dataset preparation

The dataset was prepared and split into training, validation, and test sets.

| Split | Number of examples |
|---|---:|
| Training | 21,497 |
| Validation | 2,687 |
| Test | 2,688 |
| **Total** | **26,872** |

The test dataset was kept separate from training and validation for evaluation.

## Model and Fine-Tuning

The base model used is [Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct).

The model was fine-tuned using **LoRA (Low-Rank Adaptation)**, a parameter-efficient fine-tuning technique that trains a smaller set of additional parameters instead of updating all the base model weights.

The training workflow used Google Colab with a T4 GPU and 4-bit quantization to reduce memory requirements.

The trained LoRA adapter is stored locally in the project under:

```text
backend/
└── model_adapter/
    ├── adapter_config.json
    ├── adapter_model.safetensors
    ├── tokenizer.json
    └── tokenizer_config.json
```

The base model and adapter are used together for inference. The adapter alone is not a complete standalone language model.

## Project Structure

```text
SupportGen-AI/
├── backend/
│   ├── app.py
│   ├── model_service.py
│   └── model_adapter/
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── data/
│   └── processed/
│       ├── train.csv
│       ├── validation.csv
│       └── test.csv
├── prepare_dataset.py
├── split_dataset.py
├── requirements.txt
└── README.md
```

*This structure describes the main project files. Additional files may be present in the repository.*

## Requirements

- Python 3.10 or a compatible Python environment
- Visual Studio Code or another code editor
- Google account with access to Google Colab
- Internet connection
- An ngrok account and authentication token for the temporary tunnel
- The trained model adapter and required Python dependencies

## Installation and Setup

### 1. Clone the repository

Replace the placeholder below with your actual GitHub repository URL.

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd SupportGen-AI
```

### 2. Create a virtual environment

On Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 3. Install dependencies

```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Ensure that `requirements.txt` contains the packages required by the local backend, including Flask, Flask-CORS, and Requests. Model-training and inference dependencies may be installed separately in the Colab environment.

### 4. Start the model inference service

Open the Colab notebook used for model inference.

1. Connect to the runtime.
2. Load the base model and fine-tuned adapter.
3. Start the Flask inference service in Colab.
4. Configure the ngrok tunnel.
5. Copy the current tunnel URL.

The Colab runtime must remain active while the local application uses the model.

### 5. Configure environment variables

In the same PowerShell terminal used to start the local backend, configure the current Colab API URL and your private API key.

```powershell
$env:SUPPORTGEN_COLAB_URL = "YOUR_CURRENT_NGROK_URL"
$secure = Read-Host "Enter your SupportGen API key" -AsSecureString
$env:SUPPORTGEN_API_KEY = [System.Net.NetworkCredential]::new("", $secure).Password
Remove-Variable secure
```

Use your actual URL and the API key configured in your Colab notebook. Do not publish the API key or ngrok authentication token.

These environment variables are session-specific and must be configured again if you open a new terminal.

### 6. Start the local backend

From the project root:

```powershell
python backend/app.py
```

The local API should be available at:

```text
http://127.0.0.1:5000
```

Health check:

```text
http://127.0.0.1:5000/api/health
```

### 7. Open the frontend

Open `frontend/index.html` in your browser, or serve the frontend using a local development server.

Keep the Flask backend running and ensure the Colab inference API is reachable.

## API Endpoints

### Health check

```http
GET /api/health
```

Returns the backend status and whether the configured model service reports the model as loaded.

### Predict customer support message

```http
POST /api/predict
Content-Type: application/json
```

Example request:

```json
{
  "message": "I was charged twice for my order. Could you please help me?"
}
```

Example response:

```json
{
  "category": "PAYMENT",
  "intent": "payment_issue",
  "suggested_reply": "I'm sorry to hear that you were charged twice..."
}
```

The example response is illustrative; actual predictions depend on the model output.

## Model Evaluation

A preliminary evaluation was performed using the first 50 examples from the held-out test dataset.

| Metric | Preliminary result |
|---|---:|
| Examples evaluated | 50 |
| Category accuracy | 100% (50/50) |
| Intent accuracy | 98% (49/50) |

One intent prediction was incorrect: the expected intent was `payment_issue`, while the predicted intent was `payment_issue_report`. The predicted category was correct.

**Evaluation limitation:** These results represent only 50 examples, not the complete 2,688-example test set. They should not be interpreted as final or representative overall model performance.

The evaluation output was saved in Colab as `supportgen_evaluation_50.csv`.

## Safety and Limitations

- Suggested replies are AI-generated drafts and should be reviewed before being sent to customers.
- The system does not independently process refunds, cancel orders, change account details, or perform other real-world support actions.
- A generated response must not be treated as confirmation that an action has been completed.
- Recent Activity is stored in the current browser using local storage and is not synchronized across devices.
- The current inference setup relies on Google Colab and a temporary ngrok URL. The service may become unavailable when the runtime disconnects or the tunnel changes.
- CPU inference can be slow.
- Model accuracy has not yet been established across the full test dataset.
- Use synthetic or appropriately anonymized customer messages during development.

## Future Improvements

- Evaluate the complete held-out test dataset and report additional metrics.
- Improve inference latency and optimize model serving.
- Deploy the inference API on a persistent hosting platform.
- Add a persistent database for activity history.
- Improve response quality testing, safety checks, and error monitoring.
- Add automated tests for API endpoints and frontend workflows.

## License and Acknowledgements

This project uses the Bitext Customer Support LLM Chatbot Training Dataset. Review the dataset's published license and terms before redistributing the dataset or derivative materials.

The base model is Qwen2.5-1.5B-Instruct. Review its model card and license for applicable usage and redistribution conditions.

This project is developed for learning, experimentation, and demonstration of fine-tuned language models in customer support workflows.
