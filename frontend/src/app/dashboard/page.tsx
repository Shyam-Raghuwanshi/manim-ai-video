"use client";

import { useState, useEffect } from 'react';
import { FaPlay, FaSpinner, FaDownload, FaCode } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { videoAPI } from '@/lib/api';
import Modal from '@/components/Modal';
import CodeViewer from '@/components/CodeViewer';

interface Video {
  id: string;
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  video_path?: string;
  thumbnail_path?: string;
}

export default function Dashboard() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [manimCode, setManimCode] = useState('');

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    // Load user's videos when component mounts
    if (isAuthenticated) {
      fetchVideos();
    }
  }, [isAuthenticated]);

  const fetchVideos = async () => {
    try {
      setIsLoadingVideos(true);
      const videos = await videoAPI.getVideos();
      setVideos(videos);
      if (videos.length > 0) {
        setCurrentVideo(videos[0]);
      }
    } catch (err) {
      console.error('Failed to fetch videos:', err);
      setError('Failed to load your videos. Please refresh the page.');
    } finally {
      setIsLoadingVideos(false);
    }
  };

  const generateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Please enter a prompt describing the animation you want to create');
      return;
    }
    
    setError(null);
    setIsGenerating(true);
    
    try {
      // Call the backend API to generate video
      const response = await videoAPI.generateVideo(prompt);
      
      // Create a new video object from the response
      const newVideo: Video = {
        id: response.video_id,
        prompt,
        status: response.status || 'processing',
        created_at: new Date().toISOString(),
      };
      
      // Add it to the videos array
      setVideos([newVideo, ...videos]);
      setCurrentVideo(newVideo);
      setPrompt('');
      
      // If the video generation is asynchronous, poll for updates
      if (newVideo.status === 'pending' || newVideo.status === 'processing') {
        pollVideoStatus(newVideo.id);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate video. Please try again.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const pollVideoStatus = async (videoId: string) => {
    // Poll the video status every 5 seconds
    const intervalId = setInterval(async () => {
      try {
        const videoData = await videoAPI.getVideo(videoId);
        
        // Update the video in the videos array
        setVideos(prevVideos => 
          prevVideos.map(video => 
            video.id === videoId ? { ...video, ...videoData } : video
          )
        );
        
        // Update current video if it's the one being polled
        if (currentVideo?.id === videoId) {
          setCurrentVideo(videoData);
        }
        
        // If video is completed or failed, stop polling
        if (videoData.status === 'completed' || videoData.status === 'failed') {
          clearInterval(intervalId);
        }
      } catch (error) {
        console.error('Error polling video status:', error);
        clearInterval(intervalId);
      }
    }, 5000);
    
    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  };
  
  const handleViewCode = async () => {
    if (!currentVideo) return;
    
    try {
      const response = await videoAPI.getVideoCode(currentVideo.id);
      setManimCode(response.code);
      setShowCodeModal(true);
    } catch (error) {
      console.error('Error fetching code:', error);
      setError('Failed to load code. Please try again.');
    }
  };
  
  const handleDownloadVideo = () => {
    if (!currentVideo || currentVideo.status !== 'completed') return;
    
    // Create a link to download the video
    const link = document.createElement('a');
    link.href = `${process.env.NEXT_PUBLIC_API_URL}/api/videos/${currentVideo.id}/file`;
    link.download = `manim-animation-${currentVideo.id}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-blue-600 text-4xl" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-blue-900 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Your Dashboard</h1>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar with previous videos */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl text-black font-semibold mb-4">Your Videos</h2>
              
              {isLoadingVideos ? (
                <div className="flex justify-center py-8">
                  <FaSpinner className="animate-spin text-blue-600 text-xl" />
                </div>
              ) : videos.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No videos yet. Create your first animation!
                </p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {videos.map((video) => (
                    <div 
                      key={video.id} 
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        currentVideo?.id === video.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setCurrentVideo(video)}
                    >
                      <p className="font-medium truncate">{video.prompt}</p>
                      <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                        <span>{new Date(video.created_at).toLocaleDateString()}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          video.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          video.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {video.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Main content area */}
          <div className="md:col-span-2">
            {/* Generate new video form */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 text-black">Create New Animation</h2>
              
              <form onSubmit={generateVideo}>
                <div className="mb-4">
                  <label htmlFor="prompt" className="block text-black font-medium mb-2">
                    Describe the mathematical animation you want to create:
                  </label>
                  <textarea
                    id="prompt"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                    placeholder="Example: Show a visual proof of the Pythagorean theorem using animations of squares on each side of a right triangle"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isGenerating}
                  />
                </div>
                
                {error && (
                  <div className="mb-4 text-red-600 bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isGenerating}
                  className={`flex items-center justify-center w-full md:w-auto px-6 py-3 rounded-lg text-white font-medium ${
                    isGenerating ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FaPlay className="mr-2" />
                      Generate Animation
                    </>
                  )}
                </button>
              </form>
            </div>
            
            {/* Current video preview */}
            {currentVideo && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Video Preview</h2>
                
                <div className="aspect-video bg-black rounded-lg mb-6 overflow-hidden">
                  {currentVideo.status === 'completed' ? (
                    <video 
                      className="w-full h-full object-contain" 
                      controls
                      poster={currentVideo.thumbnail_path || '/video-thumbnail.jpg'}
                    >
                      <source 
                        src={`${process.env.NEXT_PUBLIC_API_URL}/api/videos/${currentVideo.id}/file`} 
                        type="video/mp4" 
                      />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <div className="text-center">
                        <FaSpinner className="animate-spin text-4xl mb-4 mx-auto" />
                        <p>{currentVideo.status === 'pending' ? 'Waiting in queue...' : 'Processing your video...'}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Prompt:</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{currentVideo.prompt}</p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <button 
                    className="flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                    disabled={currentVideo.status !== 'completed'}
                    onClick={handleDownloadVideo}
                  >
                    <FaDownload className="mr-2" />
                    Download Video
                  </button>
                  
                  <button 
                    className="flex items-center px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    disabled={currentVideo.status !== 'completed'}
                    onClick={handleViewCode}
                  >
                    <FaCode className="mr-2" />
                    View Manim Code
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Code Viewer Modal */}
      {showCodeModal && (
        <Modal title="Manim Code" onClose={() => setShowCodeModal(false)}>
          <div className="max-h-[70vh] overflow-y-auto">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-sm">
              <code>{manimCode}</code>
            </pre>
          </div>
          <div className="mt-4 flex justify-end">
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={() => navigator.clipboard.writeText(manimCode)}
            >
              Copy Code
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}