'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaPlay, FaCode, FaSearch } from 'react-icons/fa';
import Modal from '@/components/Modal';

// Sample example animations
const examples = [
  {
    id: 'pythagorean-theorem',
    title: 'Pythagorean Theorem Visualization',
    description: 'A visual proof of the Pythagorean theorem showing how the squares of the sides of a right triangle relate to each other.',
    thumbnail: '/video-thumbnail.jpg',
    videoUrl: '/dummy-video.mp4',
    category: 'geometry',
    prompt: 'Create a visual proof of the Pythagorean theorem showing squares drawn on each side of a right triangle, with the area of the squares on the two shorter sides adding up to equal the area of the square on the hypotenuse.',
    code: `from manimlib import *

class PythagoreanTheorem(Scene):
    def construct(self):
        # Create a right triangle
        triangle = Polygon(
            ORIGIN, 4 * RIGHT, 4 * RIGHT + 3 * UP,
            fill_opacity=0.5,
            fill_color=BLUE_D,
            stroke_width=2,
        )
        
        # Label the sides
        labels = VGroup(
            MathTex("a").next_to(Line(ORIGIN, 4 * RIGHT), DOWN),
            MathTex("b").next_to(Line(4 * RIGHT, 4 * RIGHT + 3 * UP), RIGHT),
            MathTex("c").next_to(Line(ORIGIN, 4 * RIGHT + 3 * UP), UP+LEFT),
        )
        
        # Create squares on each side
        square_a = Square(side_length=4)
        square_a.next_to(triangle, DOWN, buff=0)
        square_a.set_fill(RED, opacity=0.5)
        
        square_b = Square(side_length=3)
        square_b.next_to(triangle, RIGHT, buff=0)
        square_b.set_fill(GREEN, opacity=0.5)
        
        # Create the square on the hypotenuse
        square_c = Polygon(
            ORIGIN, 4 * RIGHT + 3 * UP, -3 * RIGHT + 7 * UP, -7 * RIGHT + 4 * UP,
            fill_opacity=0.5,
            fill_color=YELLOW,
        )
        
        # Add labels for the areas
        area_a = MathTex("a^2").move_to(square_a.get_center())
        area_b = MathTex("b^2").move_to(square_b.get_center())
        area_c = MathTex("c^2").move_to(square_c.get_center())
        
        # Animation
        self.play(Create(triangle))
        self.play(Write(labels))
        self.wait()
        
        self.play(
            GrowFromCenter(square_a),
            Write(area_a)
        )
        self.wait()
        
        self.play(
            GrowFromCenter(square_b),
            Write(area_b)
        )
        self.wait()
        
        self.play(
            GrowFromCenter(square_c),
            Write(area_c)
        )
        self.wait()
        
        # Show the equation
        equation = MathTex("a^2", "+", "b^2", "=", "c^2")
        equation.to_edge(UP)
        
        self.play(
            TransformFromCopy(area_a, equation[0]),
            TransformFromCopy(area_b, equation[2]),
            TransformFromCopy(area_c, equation[4]),
            Write(equation[1]),
            Write(equation[3]),
        )
        self.wait(2)`
  },
  {
    id: 'calculus-derivatives',
    title: 'Introduction to Derivatives',
    description: 'Visualizing the concept of derivatives in calculus as the slope of the tangent line to a curve at a point.',
    thumbnail: '/video-thumbnail.jpg',
    videoUrl: '/dummy-video.mp4',
    category: 'calculus',
    prompt: 'Create an animation that explains the concept of derivatives in calculus, showing how the derivative is the slope of the tangent line at a point, and demonstrating the limit definition of the derivative.',
    code: `from manimlib import *

class DerivativeIntroduction(Scene):
    def construct(self):
        # Create the axes
        axes = Axes(
            x_range=(-3, 3, 1),
            y_range=(-2, 6, 1),
            height=5.5,
            width=10,
            axis_config={"color": BLUE},
        )
        
        # Add labels
        x_label = axes.get_x_axis_label("x")
        y_label = axes.get_y_axis_label("y")
        
        # Create the function graph
        def func(x):
            return x**2
        
        graph = axes.get_graph(
            func,
            x_range=(-3, 3),
            color=YELLOW
        )
        graph_label = axes.get_graph_label(
            graph,
            MathTex("f(x) = x^2"),
            x=1.5
        )
        
        # Show the axes and graph
        self.play(
            Create(axes),
            Write(x_label),
            Write(y_label)
        )
        self.play(
            Create(graph),
            Write(graph_label),
        )
        self.wait()
        
        # Point on the curve
        x_point = 1
        dot = Dot(axes.c2p(x_point, func(x_point)), color=RED)
        
        # Show the point
        self.play(FadeIn(dot, scale=2))
        
        # Show the coordinates
        coord_label = MathTex(f"({x_point}, {func(x_point)})")
        coord_label.next_to(dot, UP+RIGHT, buff=0.1)
        self.play(Write(coord_label))
        self.wait()
        
        # Calculate the slope at x = 1
        slope = 2 * x_point  # Derivative of x^2 is 2x
        
        # Create the tangent line
        tangent = axes.get_secant_slope_group(
            x=x_point,
            graph=graph,
            dx=0.01,
            secant_line_length=4,
            secant_line_color=GREEN
        )
        
        # Show the tangent line
        self.play(Create(tangent))
        self.wait()
        
        # Show the derivative value
        derivative_label = MathTex(f"f'({x_point}) = {slope}")
        derivative_label.to_edge(UP)
        self.play(Write(derivative_label))
        self.wait()
        
        # Show the general derivative formula
        general_derivative = MathTex(
            "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}"
        )
        general_derivative.next_to(derivative_label, DOWN)
        self.play(Write(general_derivative))
        
        # For f(x) = x^2, f'(x) = 2x
        derivative_formula = MathTex(
            "f'(x) = 2x"
        )
        derivative_formula.next_to(general_derivative, DOWN)
        self.play(Write(derivative_formula))
        self.wait(2)`
  },
  {
    id: 'vector-fields',
    title: 'Vector Fields and Flow',
    description: 'Exploring vector fields and how particles move through them, a fundamental concept in physics and mathematics.',
    thumbnail: '/video-thumbnail.jpg',
    videoUrl: '/dummy-video.mp4',
    category: 'linear-algebra',
    prompt: 'Create an animation that shows a 2D vector field with arrows indicating the direction and magnitude of the field at each point, then demonstrate how particles would flow through this field over time.',
    code: `from manimlib import *

class VectorField(Scene):
    def construct(self):
        # Create a grid of coordinates
        x_range = (-5, 5)
        y_range = (-3, 3)
        
        # Define a vector field function (e.g., a rotational field)
        def vector_field_func(point):
            x, y = point[:2]
            return np.array([-y, x, 0]) / (np.sqrt(x**2 + y**2) + 1)
        
        # Create the vector field
        vector_field = ArrowVectorField(
            vector_field_func,
            x_range=x_range,
            y_range=y_range,
            delta_x=0.5,
            delta_y=0.5,
            length_func=lambda norm: 0.45 * sigmoid(norm),
            colors=[BLUE_D, BLUE, BLUE_A],
        )
        
        # Title
        title = Text("Vector Field", font_size=36)
        title.to_edge(UP)
        
        # Show the vector field
        self.play(
            Write(title),
            LaggedStartMap(GrowArrow, vector_field)
        )
        self.wait()
        
        # Add some particles to show the flow
        n_points = 15
        dots = VGroup(*[
            Dot(
                point=np.array([
                    np.random.uniform(*x_range),
                    np.random.uniform(*y_range),
                    0
                ]),
                radius=0.05,
                color=YELLOW
            )
            for _ in range(n_points)
        ])
        
        # Show the initial position of particles
        self.play(FadeIn(dots))
        self.wait()
        
        # Animate particles flowing through the field
        stream_lines = StreamLines(
            vector_field_func,
            x_range=x_range,
            y_range=y_range,
            padding=0.5,
            stroke_width=2,
            color=WHITE,
        )
        
        self.add(stream_lines)
        stream_lines.start_animation(flow_speed=1, max_anchors_per_line=30)
        
        # Move the particles along the field
        def update_dots(dots, dt):
            for dot in dots:
                point = dot.get_center()
                field_vector = vector_field_func(point)
                dot.shift(field_vector * dt)
                
                # If the particle goes out of frame, wrap around
                x, y, _ = dot.get_center()
                if x < x_range[0]:
                    dot.shift((x_range[1] - x_range[0]) * RIGHT)
                elif x > x_range[1]:
                    dot.shift((x_range[0] - x_range[1]) * RIGHT)
                    
                if y < y_range[0]:
                    dot.shift((y_range[1] - y_range[0]) * UP)
                elif y > y_range[1]:
                    dot.shift((y_range[0] - y_range[1]) * UP)
                
        dots.add_updater(update_dots)
        self.wait(10)  # Let the animation run
        
        # Clean up
        dots.clear_updaters()
        self.wait(2)`
  },
  {
    id: 'fourier-series',
    title: 'Fourier Series Approximation',
    description: 'Demonstrating how a square wave can be approximated using a sum of sine waves of different frequencies.',
    thumbnail: '/video-thumbnail.jpg',
    videoUrl: '/dummy-video.mp4',
    category: 'analysis',
    prompt: 'Create an animation showing how a square wave can be approximated using a Fourier series, starting with just the fundamental frequency and gradually adding higher harmonics to show the convergence.',
    code: `from manimlib import *

class FourierSeriesApproximation(Scene):
    def construct(self):
        # Set up the axes
        axes = Axes(
            x_range=(-5, 5, 1),
            y_range=(-2, 2, 1),
            axis_config={"color": BLUE},
            height=6,
            width=10
        )
        
        # Add labels
        x_label = axes.get_x_axis_label(MathTex("t"))
        y_label = axes.get_y_axis_label(MathTex("f(t)"))
        
        # Title
        title = Text("Fourier Series Approximation of a Square Wave", font_size=32)
        title.to_edge(UP)
        
        # Function to compute the nth term in the Fourier series of a square wave
        def fourier_term(x, n):
            return (4 / (n * PI)) * np.sin(n * x)
        
        # Function to compute the Fourier series approximation with N terms
        def fourier_series(x, N):
            result = np.zeros_like(x)
            for n in range(1, N + 1, 2):  # Only odd harmonics for square wave
                result += fourier_term(x, n)
            return result
        
        # Create the actual square wave
        def square_wave(x):
            return np.array([1 if x_i % (2 * PI) < PI else -1 for x_i in x])
        
        # Create the graphs
        x_vals = np.linspace(-5, 5, 1000)
        square_graph = axes.get_graph(
            lambda x: square_wave(x),
            x_range=(-5, 5),
            color=RED
        )
        
        # Show the axes
        self.play(
            Create(axes),
            Write(x_label),
            Write(y_label),
            Write(title)
        )
        self.wait()
        
        # Show the target square wave
        square_label = MathTex("\\text{Target: Square Wave}")
        square_label.set_color(RED)
        square_label.to_corner(UR)
        
        self.play(
            Create(square_graph),
            Write(square_label)
        )
        self.wait()
        
        # Show the approximations with increasing terms
        approximation_graph = None
        max_terms = 19
        
        fourier_label = MathTex("\\text{Fourier Approximation: }")
        fourier_label.next_to(square_label, DOWN)
        fourier_label.align_to(square_label, LEFT)
        
        term_label = MathTex("N = 1")
        term_label.next_to(fourier_label, RIGHT)
        
        self.play(Write(fourier_label), Write(term_label))
        
        for N in [1, 3, 5, 9, 19]:
            # Calculate Fourier approximation
            new_graph = axes.get_graph(
                lambda x: fourier_series(x, N),
                x_range=(-5, 5),
                color=YELLOW
            )
            
            # Update term label
            new_term_label = MathTex(f"N = {N}")
            new_term_label.next_to(fourier_label, RIGHT)
            
            if approximation_graph:
                self.play(
                    ReplacementTransform(approximation_graph, new_graph),
                    ReplacementTransform(term_label, new_term_label)
                )
            else:
                self.play(
                    Create(new_graph),
                )
            
            approximation_graph = new_graph
            term_label = new_term_label
            
            self.wait()
            
        # Show the Fourier series formula for a square wave
        formula = MathTex(
            "f(t) = \\frac{4}{\\pi} \\sum_{n=1,3,5,...}^\\infty \\frac{1}{n} \\sin(nt)"
        )
        formula.to_edge(DOWN)
        self.play(Write(formula))
        self.wait(2)`
  }
];

const categories = [
  { id: 'all', name: 'All Examples' },
  { id: 'geometry', name: 'Geometry' },
  { id: 'calculus', name: 'Calculus' },
  { id: 'linear-algebra', name: 'Linear Algebra' },
  { id: 'analysis', name: 'Analysis' }
];

export default function ExamplesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedExample, setSelectedExample] = useState<typeof examples[0] | null>(null);
  const [modalType, setModalType] = useState<'video' | 'code'>('video');
  
  const filteredExamples = examples.filter(example => 
    (selectedCategory === 'all' || example.category === selectedCategory) &&
    (example.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     example.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleOpenModal = (example: typeof examples[0], type: 'video' | 'code') => {
    setSelectedExample(example);
    setModalType(type);
    setShowModal(true);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Animation Examples</h1>
          <p className="text-xl max-w-3xl">
            Explore examples of mathematical animations created with ManimAI. Click on any example to 
            watch the full animation or view the generated code.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Search and filter */}
        <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                className={`px-4 py-2 rounded-full ${
                  selectedCategory === category.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white hover:bg-gray-100'
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
          
          <div className="w-full md:w-64 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search examples..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Examples grid */}
        {filteredExamples.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-xl">No examples found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredExamples.map(example => (
              <div key={example.id} className="bg-white rounded-xl overflow-hidden shadow-md">
                <div className="aspect-video relative">
                  <Image
                    src={example.thumbnail}
                    alt={example.title}
                    fill
                    className="object-cover"
                  />
                  <div 
                    className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => handleOpenModal(example, 'video')}
                  >
                    <div className="bg-blue-600 text-white p-3 rounded-full">
                      <FaPlay />
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{example.title}</h3>
                  <p className="text-gray-600 mb-4">{example.description}</p>
                  
                  <div className="flex justify-between">
                    <button
                      className="inline-flex items-center text-blue-600 hover:text-blue-800"
                      onClick={() => handleOpenModal(example, 'video')}
                    >
                      <FaPlay className="mr-2" />
                      Watch Animation
                    </button>
                    
                    <button
                      className="inline-flex items-center text-gray-700 hover:text-gray-900"
                      onClick={() => handleOpenModal(example, 'code')}
                    >
                      <FaCode className="mr-2" />
                      View Code
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Create your own CTA */}
        <div className="mt-16 py-12 px-8 bg-blue-50 rounded-xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to create your own animations?</h2>
          <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Use ManimAI to generate beautiful mathematical animations from text descriptions.
            No coding required!
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-lg"
          >
            Get Started
          </Link>
        </div>
      </div>
      
      {/* Modal for video or code viewing */}
      {showModal && selectedExample && (
        <Modal 
          title={modalType === 'video' ? selectedExample.title : 'Generated Manim Code'} 
          onClose={() => setShowModal(false)}
        >
          {modalType === 'video' ? (
            <div className="aspect-video w-full">
              <video 
                className="w-full h-full" 
                controls 
                autoPlay
                poster={selectedExample.thumbnail}
              >
                <source src={selectedExample.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              <div className="mt-4">
                <h3 className="font-medium mb-2">Prompt Used:</h3>
                <div className="bg-gray-50 p-4 rounded-md text-gray-700">
                  {selectedExample.prompt}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="font-medium mb-2">Generated Code:</h3>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                <pre><code>{selectedExample.code}</code></pre>
              </div>
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={() => navigator.clipboard.writeText(selectedExample.code)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Copy Code
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}