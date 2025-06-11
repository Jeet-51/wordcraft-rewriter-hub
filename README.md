
# AI Humanizer - Make Your AI Text Sound Human

Transform AI-generated content into natural, human-like text that bypasses AI detection tools using advanced OpenAI technology.

## 🌟 Features

- **AI Text Humanization**: Convert AI-generated content to human-like text using OpenAI
- **Document Processing**: Upload and process .txt, .docx, and .pdf files
- **Customizable Options**: Adjust readability level, writing purpose, and humanization strength
- **User Authentication**: Secure user accounts with Supabase Auth
- **Credit System**: Track usage with built-in credit management
- **History Tracking**: View and manage your humanization history
- **Real-time Processing**: Live text transformation with instant feedback
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Live Demo

Visit the live application: [AI Humanizer](https://your-username.github.io/wordcraft-rewriter-hub/)

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Database, Authentication, Edge Functions)
- **AI Integration**: OpenAI API for text humanization
- **Deployment**: GitHub Pages with GitHub Actions
- **State Management**: TanStack React Query
- **Routing**: React Router DOM
- **Icons**: Lucide React

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI API key

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/wordcraft-rewriter-hub.git
   cd wordcraft-rewriter-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL migrations (see Database Setup section)
   - Configure authentication providers

4. **Configure environment variables**
   - Update `src/integrations/supabase/client.ts` with your Supabase project details
   - Add your OpenAI API key to Supabase Edge Function secrets

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:8080`

## 🗄️ Database Setup

The application uses Supabase as the backend. Run these SQL commands in your Supabase SQL editor:

```sql
-- Create profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  username text,
  credits_total integer DEFAULT 10,
  credits_used integer DEFAULT 0,
  plan text DEFAULT 'free',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create humanizations table
CREATE TABLE public.humanizations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  original_text text NOT NULL,
  humanized_text text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create contact_messages table
CREATE TABLE public.contact_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create payment_history table
CREATE TABLE public.payment_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  plan_id text NOT NULL,
  plan_name text NOT NULL,
  amount text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.humanizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own humanizations" ON public.humanizations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own humanizations" ON public.humanizations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create trigger for new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, credits_total, credits_used, plan)
  VALUES (new.id, new.raw_user_meta_data->>'username', 10, 0, 'free');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## 🔧 Configuration

### Supabase Edge Function Setup

The application uses a Supabase Edge Function for OpenAI integration. The function is located at `supabase/functions/humanize-text/index.ts`.

Required secrets in Supabase:
- `OPENAI_API_KEY`: Your OpenAI API key

### GitHub Pages Deployment

The project is configured for automatic deployment to GitHub Pages using GitHub Actions:

1. **Enable GitHub Pages**
   - Go to your repository settings
   - Navigate to Pages section
   - Select "GitHub Actions" as the source

2. **Workflow Permissions**
   - Go to Settings → Actions → General
   - Set "Workflow permissions" to "Read and write permissions"
   - Enable "Allow GitHub Actions to create and approve pull requests"

3. **Deploy**
   - Push to the main branch
   - GitHub Actions will automatically build and deploy your site

## 🎯 Usage

### Basic Text Humanization

1. **Sign up/Login** to your account
2. **Navigate** to the Humanizer tab
3. **Paste** your AI-generated text (minimum 50 characters)
4. **Adjust** humanization options:
   - Readability level (High School to Doctorate)
   - Writing purpose (General, Academic, Business, etc.)
   - Humanization strength (0.1 - 0.9)
5. **Click** "Humanize Text" and wait for results
6. **Copy** the humanized text or view it in your history

### Document Processing

1. **Go** to the Documents tab
2. **Upload** a .txt, .docx, or .pdf file (max 10MB)
3. **Extract** text from the document
4. **Humanize** the extracted text with one click
5. **View** results in the History tab

### Managing Your Account

- **View** credit usage in the dashboard
- **Access** humanization history
- **Upgrade** your plan for more credits
- **Contact** support for assistance

## 📚 API Reference

### Humanization Options

```typescript
interface HumanizationOptions {
  readability?: 'High School' | 'University' | 'Doctorate' | 'Journalist' | 'Marketing';
  purpose?: 'General Writing' | 'Academic' | 'Business' | 'Creative' | 'Technical';
  strength?: number; // 0.1 to 0.9
}
```

### User Profile

```typescript
interface Profile {
  id: string;
  username?: string;
  credits_total: number;
  credits_used: number;
  plan: 'free' | 'basic' | 'premium';
  created_at: string;
  updated_at: string;
}
```

## 🚀 Deployment

### GitHub Pages (Recommended)

The project is pre-configured for GitHub Pages deployment:

```bash
# Push to main branch
git push origin main

# GitHub Actions will automatically deploy to:
# https://your-username.github.io/wordcraft-rewriter-hub/
```

### Manual Build

```bash
# Build for production
npm run build

# Preview build locally
npm run preview
```

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── dashboard/      # Dashboard-specific components
│   ├── humanizer/      # Humanizer tool components
│   └── document/       # Document processing components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and Supabase client
├── pages/              # Page components
├── context/            # React context providers
└── integrations/       # Third-party integrations
```

### Key Components

- `HumanizerTool`: Main text humanization interface
- `DocumentExtractor`: File upload and text extraction
- `useTextHumanization`: Hook for text processing logic
- `AuthContext`: User authentication management

## 🔒 Security

- **Row Level Security**: Implemented on all database tables
- **User Authentication**: Secure authentication via Supabase Auth
- **API Protection**: Edge functions with proper error handling
- **Input Validation**: Client and server-side validation
- **CORS**: Properly configured for secure API calls

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Implement proper error handling
- Add tests for new features
- Keep components small and focused
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Project Wiki](https://github.com/your-username/wordcraft-rewriter-hub/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/wordcraft-rewriter-hub/issues)
- **Contact**: Use the contact form in the application

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for AI text processing
- [Supabase](https://supabase.com/) for backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide](https://lucide.dev/) for icons

## 📊 Project Status

- ✅ Core humanization functionality
- ✅ User authentication and profiles
- ✅ Document processing
- ✅ Credit system
- ✅ History tracking
- ✅ GitHub Pages deployment
- 🔄 Payment integration (in progress)
- 🔄 Advanced analytics (planned)

---

**Built with ❤️ using React, TypeScript, and Supabase**

For more information, visit our [live demo](https://your-username.github.io/wordcraft-rewriter-hub/) or check out the [documentation](https://github.com/your-username/wordcraft-rewriter-hub/wiki).
