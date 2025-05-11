'use client';

interface CodeViewerProps {
  code: string;
  language?: string;
}

const CodeViewer = ({ code, language = 'python' }: CodeViewerProps) => {
  return (
    <div className="rounded-md overflow-hidden">
      <pre className="bg-gray-900 text-gray-100 p-4 overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default CodeViewer;