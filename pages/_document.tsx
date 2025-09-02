import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style jsx global>{`
          /* App-specific styles */
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
              'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
              sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          /* Glass morphism effect */
          .glass-card {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          }

          /* Enhanced buttons */
          .btn-gradient {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            padding: 16px 24px;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            display: inline-block;
            text-decoration: none;
            text-align: center;
          }

          .btn-gradient:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
          }

          .btn-success-gradient {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            border: none;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
            padding: 16px 24px;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            display: inline-block;
            text-decoration: none;
            text-align: center;
          }

          .btn-success-gradient:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(16, 185, 129, 0.6);
          }

          .btn-danger-gradient {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            border: none;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
            padding: 16px 24px;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            display: inline-block;
            text-decoration: none;
            text-align: center;
          }

          .btn-danger-gradient:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(239, 68, 68, 0.6);
          }

          /* Enhanced inputs */
          .input-enhanced {
            background: rgba(255, 255, 255, 0.9);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 12px;
            padding: 16px 20px;
            font-size: 16px;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            width: 100%;
          }

          .input-enhanced:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
            transform: translateY(-1px);
          }

          /* Footer styling */
          .footer-enhanced {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            padding: 20px 30px;
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
          }

          /* Dashboard specific styles */
          .dashboard-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem 0;
            margin-bottom: 2rem;
          }

          .stats-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 16px;
            padding: 1.5rem;
            transition: all 0.3s ease;
          }

          .stats-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          }

          /* Activity updates styling */
          .activity-item {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 1rem;
            margin-bottom: 0.75rem;
            transition: all 0.3s ease;
          }

          .activity-item:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: translateX(5px);
          }

          /* Modal styling */
          .modal-enhanced {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          }

          /* Basic utility classes */
          .min-h-screen { min-height: 100vh; }
          .flex { display: flex; }
          .flex-col { flex-direction: column; }
          .justify-center { justify-content: center; }
          .items-center { align-items: center; }
          .text-center { text-align: center; }
          .relative { position: relative; }
          .absolute { position: absolute; }
          .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
          .overflow-hidden { overflow: hidden; }
          .z-10 { z-index: 10; }
          .mt-8 { margin-top: 2rem; }
          .mt-12 { margin-top: 3rem; }
          .mb-2 { margin-bottom: 0.5rem; }
          .mb-3 { margin-bottom: 0.75rem; }
          .mb-4 { margin-bottom: 1rem; }
          .mb-6 { margin-bottom: 1.5rem; }
          .mb-8 { margin-bottom: 2rem; }
          .py-10 { padding-top: 2.5rem; padding-bottom: 2.5rem; }
          .py-12 { padding-top: 3rem; padding-bottom: 3rem; }
          .px-8 { padding-left: 2rem; padding-right: 2rem; }
          .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
          .px-4 { padding-left: 1rem; padding-right: 1rem; }
          .w-full { width: 100%; }
          .max-w-md { max-width: 28rem; }
          .rounded-3xl { border-radius: 1.5rem; }
          .rounded-xl { border-radius: 0.75rem; }
          .space-y-6 > * + * { margin-top: 1.5rem; }
          .block { display: block; }
          .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
          .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
          .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
          .font-extrabold { font-weight: 800; }
          .font-semibold { font-weight: 600; }
          .font-bold { font-weight: 700; }
          .text-white { color: white; }
          .text-blue-100 { color: #dbeafe; }
          .text-blue-200 { color: #bfdbfe; }
          .text-gray-800 { color: #1f2937; }
          .text-gray-500 { color: #6b7280; }
          .text-gray-400 { color: #9ca3af; }
          .text-gray-300 { color: #d1d5db; }
          .text-gray-600 { color: #4b5563; }
          .text-green-400 { color: #4ade80; }
          .text-red-400 { color: #f87171; }

          /* Background gradients */
          .bg-gradient-to-br { background: linear-gradient(135deg, var(--tw-gradient-stops)); }
          .from-blue-600 { --tw-gradient-from: #2563eb; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(37, 99, 235, 0)); }
          .via-purple-600 { --tw-gradient-stops: var(--tw-gradient-from), #9333ea, var(--tw-gradient-to, rgba(147, 51, 234, 0)); }
          .to-indigo-800 { --tw-gradient-to: #3730a3; }
          .from-green-600 { --tw-gradient-from: #16a34a; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(22, 163, 74, 0)); }
          .via-blue-600 { --tw-gradient-stops: var(--tw-gradient-from), #2563eb, var(--tw-gradient-to, rgba(37, 99, 235, 0)); }
          .to-purple-800 { --tw-gradient-to: #6b21a8; }
          .from-gray-900 { --tw-gradient-from: #111827; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(17, 24, 39, 0)); }
          .via-blue-900 { --tw-gradient-stops: var(--tw-gradient-from), #1e3a8a, var(--tw-gradient-to, rgba(30, 58, 138, 0)); }
          .to-purple-900 { --tw-gradient-to: #581c87; }

          .bg-white\\/10 { background-color: rgba(255, 255, 255, 0.1); }
          .bg-white\\/5 { background-color: rgba(255, 255, 255, 0.05); }
          .rounded-full { border-radius: 9999px; }
          .blur-3xl { filter: blur(64px); }
          .animate-bounce-gentle { animation: bounceGentle 2s infinite; }
          .inline-block { display: inline-block; }
          .transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; }
          .duration-200 { transition-duration: 200ms; }
          .underline { text-decoration: underline; }
          .hover\\:text-blue-200:hover { color: #bfdbfe; }
          .hover\\:text-green-200:hover { color: #bbf7d0; }
          .disabled\\:opacity-50:disabled { opacity: 0.5; }
          .disabled\\:cursor-not-allowed:disabled { cursor: not-allowed; }
          .grid { display: grid; }
          .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .gap-4 { gap: 1rem; }
          .gap-6 { gap: 1.5rem; }
          .sm\\:mx-auto { margin-left: auto; margin-right: auto; }
          .sm\\:w-full { width: 100%; }
          .sm\\:max-w-md { max-width: 28rem; }
          .sm\\:px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
          .sm\\:px-10 { padding-left: 2.5rem; padding-right: 2.5rem; }
          .sm\\:rounded-lg { border-radius: 0.5rem; }
          .sm\\:text-sm { font-size: 0.875rem; line-height: 1.25rem; }
          .sm\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .lg\\:px-8 { padding-left: 2rem; padding-right: 2rem; }

          /* Animation keyframes */
          @keyframes bounceGentle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }

          /* Responsive design */
          @media (max-width: 768px) {
            .glass-card {
              margin: 1rem;
              padding: 1.5rem;
            }
            
            .input-enhanced {
              padding: 14px 16px;
              font-size: 14px;
            }
          }
        `}</style>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
