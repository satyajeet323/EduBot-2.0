import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const features = [
  {
    icon: '🧠',
    title: 'AI Quizzes',
    description: 'Adaptive quizzes powered by AI that adjust to your skill level and help you master topics faster.',
  },
  {
    icon: '💻',
    title: 'Code Editor',
    description: 'Write, run, and debug code in Python, Java, C++, and C directly in your browser.',
  },
  {
    icon: '🌐',
    title: 'Networking Playground',
    description: 'Simulate real network topologies with routers, switches, and PCs in an interactive canvas.',
  },
  {
    icon: '🗣️',
    title: 'English Fluency',
    description: 'Practice spoken English with AI-powered pronunciation feedback and fluency scoring.',
  },
  {
    icon: '📚',
    title: 'Syllabus Browser',
    description: 'Explore structured syllabi for every subject so you always know what to study next.',
  },
  {
    icon: '📈',
    title: 'Progress Tracking',
    description: 'Visualise your learning journey with detailed stats, streaks, and performance charts.',
  },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const heroRef = useRef(null)
  const featureCardsRef = useRef(null)
  const ctaRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!prefersReduced) {
      // Hero entrance timeline
      const tl = gsap.timeline()
      tl.from(heroRef.current.querySelectorAll('.animate-hero'), {
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power2.out',
      })

      // Features stagger on scroll
      gsap.from(featureCardsRef.current.querySelectorAll('.feature-card'), {
        opacity: 0,
        y: 50,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: featureCardsRef.current,
          start: 'top 80%',
          once: true,
        },
      })

      // CTA fade-in on scroll
      gsap.from(ctaRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top 80%',
          once: true,
        },
      })
    }

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [])

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <span className="text-2xl font-bold text-blue-600 tracking-tight">EduBot</span>

            {/* Desktop nav buttons */}
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Get Started
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              className="sm:hidden p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="sm:hidden pb-4 flex flex-col gap-2">
              <button
                onClick={() => navigate('/login')}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 text-left transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 pt-16"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="animate-hero text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
            Learn Smarter with <span className="text-yellow-300">EduBot</span>
          </h1>
          <p className="animate-hero text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            AI-powered quizzes, an in-browser code editor, networking simulations, and more — all in one platform built for modern learners.
          </p>
          <div className="animate-hero flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-3 text-base font-semibold text-blue-700 bg-white hover:bg-blue-50 rounded-xl shadow-lg transition-colors"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3 text-base font-semibold text-white border-2 border-white hover:bg-white/10 rounded-xl transition-colors"
            >
              Log In
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Everything you need to excel</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Six powerful tools, one seamless platform.
            </p>
          </div>
          <div
            ref={featureCardsRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map(({ icon, title, description }) => (
              <div
                key={title}
                className="feature-card bg-white rounded-2xl p-8 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 border border-gray-100"
              >
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        ref={ctaRef}
        className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to start your learning journey?
          </h2>
          <p className="text-lg text-blue-100 mb-10">
            Join thousands of students already using EduBot to level up their skills. It's free to get started.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-10 py-4 text-base font-semibold text-blue-700 bg-white hover:bg-blue-50 rounded-xl shadow-lg transition-colors"
          >
            Sign Up Free
          </button>
        </div>
      </section>
    </div>
  )
}
