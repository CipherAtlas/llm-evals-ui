# Multi-Model Prompt Testing Tool

This repository contains an internal experimental web tool for testing prompts across multiple LLM providers (e.g., OpenAI, Anthropic, Gemini). The tool features an infinite canvas with a node-based interface for creating and managing test flows.

## Key Node Types

- **Model Node:**  
  Enter prompts, select models, configure parameters (temperature, system prompt), and upload images. Images are uploaded to Supabase Storage and their public URL is stored in the node's data.

- **Output Node:**  
  Displays API responses rendered in Markdown. The node shows a one-line preview with overflow, and double-clicking opens an overlay (locked from dragging) that shows the full response with full text selection capabilities.

- **Master Input Node:**  
  Broadcasts a prompt (and optional image) to all Model Nodes.

- **Text Node:**  
  Allows you to label or annotate trees for easy tracking of changes between different trees.

- **Persistence & Logging:**  
  Save and load your canvas state (nodes and edges) from a Supabase database, and log execution details (including execution times) for each prompt.

## Features

- **Multi-Modal Prompts:**  
  Supports sending text prompts with an optional image (uploaded to Supabase Storage). The image URL is embedded in the prompt message sent to the API.

- **Dynamic API Integration:**  
  Routes requests to the appropriate API endpoint (ChatGPT or Gemini) based on the selected model.

- **Draggable, Node-Based UI:**  
  Built with [React Flow](https://reactflow.dev/), featuring draggable nodes, live canvas, and connection edges.

- **Image Uploads via Supabase Storage:**  
  Images are uploaded to a Supabase Storage bucket (set to public for development) and their public URL is used in API calls.

- **Persistence & Execution Logging:**  
  Save your current canvas state and view execution logs from Supabase.

## Setup

### Prerequisites

- **Node.js** (v14 or above)
- A [Supabase account](https://supabase.com/) for database and storage
- An OpenAI API key (and optionally a Google API key if using Gemini)

### Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/multi-model-prompt-tool.git
   cd multi-model-prompt-tool
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Create a `.env.local` File:**

   Create a file named `.env.local` in the root directory and add the following keys (replace with your actual values):

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   OPENAI_API_KEY=your-openai-api-key
   GOOGLE_API_KEY=your-google-api-key   # if using Gemini API route
   ```

### Supabase Setup

#### Database

Create a table for persisting canvas state. For example, in the Supabase SQL Editor, run:

```sql
CREATE TABLE canvas_states (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  state jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);
```

Create a table for execution logs:

```sql
CREATE TABLE execution_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  node_id text NOT NULL,
  prompt text,
  response text,
  execution_time numeric,
  created_at timestamp with time zone DEFAULT now()
);
```

#### Storage

1. **Create a Bucket:**  
   In the Supabase Dashboard, navigate to **Storage** and create a new bucket named `images`.

2. **Set Bucket to Public:**  
   For development, mark the bucket as public so that uploaded images are accessible via public URLs.  
   Optionally, adjust policies by running:

   ```sql
   ALTER TABLE "storage"."objects" ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Allow public uploads to images bucket"
     ON "storage"."objects"
     FOR INSERT
     TO public
     WITH CHECK (bucket_id = 'images');
   ```

   > **Note:** In production, you might want to set the bucket to private and use signed URLs.

## Usage

1. **Start the Development Server:**

   ```bash
   npm run dev
   ```

2. **Open Your Browser:**

   Navigate to [http://localhost:3000](http://localhost:3000).

3. **Using the Canvas:**

   - **Adding Nodes:**  
     Use the global buttons to add Model Nodes, Master Input Nodes, and Text Nodes.
   
   - **Model Node:**  
     - Enter your prompt, select a model from the dropdown, adjust temperature and system prompt.
     - Upload an image if desired; the image is uploaded to Supabase Storage, and the public URL is stored in the node's data.
     - Click "Start" to send the prompt (and image URL) to the API endpoint (either `/api/chat` or `/api/gemini`).
   
   - **Output Node:**  
     - Displays a one-line preview of the API response.
     - Double-click the preview to open an overlay that shows the full Markdown-rendered response. While the overlay is open, the node is locked from dragging so you can select text normally.
   
   - **Master Input Node:**  
     - Enter a prompt (and optionally upload an image) and click "Send to Model Nodes" to broadcast it.
   
   - **Text Node:**  
     - Use this node to label or annotate your trees.
   
   - **Persistence:**  
     - Save the current canvas state using the "Save Canvas" button.
     - Load saved states from the "Load Canvas" menu.

4. **API Routes:**

   - **`/api/chat`**: Processes ChatGPT requests (supports text and image URLs in a multimodal message).
   - **`/api/gemini`**: Processes Gemini requests.
   - **`/api/logs`**: Logs execution details (prompt, response, execution time) to the database.
   - **`/api/canvas`**: Handles saving and loading of canvas state.

## Scheduled Image Cleanup

To automatically delete images not referenced in any saved canvas state after 24 hours, consider one of these approaches:

1. **Supabase Storage Lifecycle Rules:**  
   Configure file retention policies (if available) to delete files after a specified period.

2. **Scheduled Function / Cron Job:**  
   Set up a scheduled function that:
   - Lists files in the `images` bucket older than 24 hours.
   - Cross-checks against your `canvas_states` table to determine if they’re unreferenced.
   - Deletes unreferenced images.

Refer to the [Supabase Storage documentation](https://supabase.com/docs/guides/storage) for more details on retention policies and scheduled tasks.

## Deployment

When deploying, use a hosting provider (e.g., Vercel) that supports secure environment variables. Ensure:

- **Environment Variables:**  
  Do not commit your `.env.local` file. Set required environment variables via your hosting provider’s dashboard.

- **Security Policies:**  
  Adjust Supabase Storage and database policies for production (e.g., using private buckets and signed URLs).

## Contributing

Contributions are welcome! Please fork this repository, create your feature branch, and submit a pull request. Make sure tests and documentation are updated as needed.

## License

This project is licensed under the [MIT License](LICENSE).
