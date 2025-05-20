
import { HumanizerTool } from "@/components/HumanizerTool";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-gray-50 py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl">
                  Make Your AI Text Sound{" "}
                  <span className="gradient-text">Human</span>
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl">
                  Transform AI-generated content into natural, human-like text that bypasses AI detection tools.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link to="/signup">
                  <Button size="lg" className="px-8">
                    Start for Free
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button variant="outline" size="lg">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1655635949212-1d8f4f103ea4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80"
                alt="AI text humanization"
                className="rounded-lg object-cover shadow-lg"
                width={600}
                height={400}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Text Converter Section */}
      <section className="py-12 md:py-24 bg-white border-t border-b">
        <div className="container px-4 md:px-6">
          <div className="space-y-4 text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Try Our AI Text Humanizer
            </h2>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-lg">
              Paste your AI-generated text below and see how our tool transforms it into natural, human-sounding content.
            </p>
          </div>
          <HumanizerTool />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-24 lg:py-32 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="space-y-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Key Features
            </h2>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-lg">
              Our AI humanizer provides all the tools you need to create natural-sounding content.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex flex-col space-y-2">
                <div className="p-2 bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center mb-2">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-primary"
                  >
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold">Bypass AI Detectors</h3>
                <p className="text-muted-foreground">
                  Our tool rewrites your text to avoid detection by AI content checkers.
                </p>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex flex-col space-y-2">
                <div className="p-2 bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center mb-2">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-primary"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="m4.93 4.93 4.24 4.24" />
                    <path d="m14.83 14.83 4.24 4.24" />
                    <path d="m14.83 9.17 4.24-4.24" />
                    <path d="m14.83 9.17-3.53-3.53" />
                    <path d="m4.93 19.07 4.24-4.24" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold">Natural Language</h3>
                <p className="text-muted-foreground">
                  Transform rigid AI text into fluid, conversational human language.
                </p>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex flex-col space-y-2">
                <div className="p-2 bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center mb-2">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-primary"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold">File Support</h3>
                <p className="text-muted-foreground">
                  Upload .txt and .docx files for batch processing of larger content pieces.
                </p>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex flex-col space-y-2">
                <div className="p-2 bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center mb-2">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-primary"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold">Privacy Protection</h3>
                <p className="text-muted-foreground">
                  Your content is never stored or reused without your permission.
                </p>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex flex-col space-y-2">
                <div className="p-2 bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center mb-2">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-primary"
                  >
                    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold">Team Collaboration</h3>
                <p className="text-muted-foreground">
                  Share humanized content with team members on enterprise plans.
                </p>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex flex-col space-y-2">
                <div className="p-2 bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center mb-2">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-primary"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold">Style Options</h3>
                <p className="text-muted-foreground">
                  Choose from various writing styles to match your target audience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="space-y-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              What Our Users Say
            </h2>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-lg">
              Discover how AI Humanizer is helping content creators worldwide.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-gray-200 w-10 h-10" />
                  <div>
                    <p className="text-sm font-medium">Sarah J.</p>
                    <p className="text-xs text-gray-500">Content Marketer</p>
                  </div>
                </div>
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted-foreground">
                  "This tool has saved me so much time. I can quickly humanize AI-generated drafts before submitting them to clients."
                </p>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-gray-200 w-10 h-10" />
                  <div>
                    <p className="text-sm font-medium">Michael T.</p>
                    <p className="text-xs text-gray-500">Freelance Writer</p>
                  </div>
                </div>
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted-foreground">
                  "I was skeptical at first, but the humanized output is genuinely impressive. It keeps the meaning while sounding much more natural."
                </p>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-gray-200 w-10 h-10" />
                  <div>
                    <p className="text-sm font-medium">Elena K.</p>
                    <p className="text-xs text-gray-500">SEO Specialist</p>
                  </div>
                </div>
                <div className="flex text-yellow-500">
                  {[...Array(4)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-yellow-500"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <p className="text-muted-foreground">
                  "The file upload feature makes it easy to process entire blog posts at once, and the results consistently pass AI content checkers."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-brand-purple to-brand-dark-purple text-white">
        <div className="container px-4 md:px-6 text-center">
          <div className="mx-auto max-w-2xl space-y-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Ready to Humanize Your AI Content?
            </h2>
            <p className="mx-auto max-w-[600px] text-gray-100 md:text-xl">
              Start with our free plan and upgrade anytime to access more credits and advanced features.
            </p>
            <div className="flex flex-col gap-4 min-[400px]:flex-row justify-center">
              <Link to="/signup">
                <Button size="lg" variant="secondary" className="px-8">
                  Start for Free
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-brand-dark-purple">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
