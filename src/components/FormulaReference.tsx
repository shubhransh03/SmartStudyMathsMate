import { useState } from 'react';
import { Calculator, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import MathFormula from './MathFormula';

interface Formula {
  name: string;
  formula: string;
  description: string;
  variables?: string;
}

interface FormulaCategory {
  category: string;
  formulas: Formula[];
}

const FormulaReference = ({ topic }: { topic?: string }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const formulaCategories: FormulaCategory[] = [
    {
      category: 'Quadratic Equations',
      formulas: [
        {
          name: 'Quadratic Formula',
          formula: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
          description: 'General solution for ax² + bx + c = 0',
          variables: 'where a ≠ 0, b, c are constants'
        },
        {
          name: 'Discriminant',
          formula: '\\Delta = b^2 - 4ac',
          description: 'Determines nature of roots',
          variables: 'Δ > 0: real & distinct, Δ = 0: equal, Δ < 0: imaginary'
        }
      ]
    },
    {
      category: 'Arithmetic Progressions',
      formulas: [
        {
          name: 'nth Term',
          formula: 'a_n = a + (n-1)d',
          description: 'nth term of an A.P.',
          variables: 'a = first term, d = common difference, n = term number'
        },
        {
          name: 'Sum of n Terms',
          formula: 'S_n = \\frac{n}{2}[2a + (n-1)d]',
          description: 'Sum of first n terms',
          variables: 'Alternative: S_n = n/2[first term + last term]'
        }
      ]
    },
    {
      category: 'Coordinate Geometry',
      formulas: [
        {
          name: 'Distance Formula',
          formula: 'd = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}',
          description: 'Distance between two points',
          variables: 'Points: (x₁, y₁) and (x₂, y₂)'
        },
        {
          name: 'Section Formula',
          formula: '(x, y) = \\left(\\frac{mx_2+nx_1}{m+n}, \\frac{my_2+ny_1}{m+n}\\right)',
          description: 'Point dividing line segment internally',
          variables: 'Ratio m:n, Points: (x₁, y₁) and (x₂, y₂)'
        }
      ]
    },
    {
      category: 'Circles',
      formulas: [
        {
          name: 'Standard Form',
          formula: '(x-h)^2 + (y-k)^2 = r^2',
          description: 'Circle with center (h,k) and radius r',
          variables: 'Center: (h, k), Radius: r'
        },
        {
          name: 'Length of Tangent',
          formula: 'L = \\sqrt{x_1^2 + y_1^2 + 2gx_1 + 2fy_1 + c}',
          description: 'From external point to circle',
          variables: 'From point (x₁, y₁) to circle x² + y² + 2gx + 2fy + c = 0'
        }
      ]
    },
    {
      category: 'Surface Areas and Volumes',
      formulas: [
        {
          name: 'Sphere Volume',
          formula: 'V = \\frac{4}{3}\\pi r^3',
          description: 'Volume of a sphere',
          variables: 'r = radius'
        },
        {
          name: 'Cone Volume',
          formula: 'V = \\frac{1}{3}\\pi r^2 h',
          description: 'Volume of a cone',
          variables: 'r = base radius, h = height'
        },
        {
          name: 'Cylinder Surface Area',
          formula: 'TSA = 2\\pi r(r + h)',
          description: 'Total surface area of cylinder',
          variables: 'r = radius, h = height'
        }
      ]
    },
    {
      category: 'Trigonometry',
      formulas: [
        {
          name: 'Basic Ratios',
          formula: '\\sin\\theta = \\frac{opposite}{hypotenuse}, \\cos\\theta = \\frac{adjacent}{hypotenuse}, \\tan\\theta = \\frac{opposite}{adjacent}',
          description: 'Fundamental trigonometric ratios',
          variables: 'θ = angle in right triangle'
        },
        {
          name: 'Pythagorean Identity',
          formula: '\\sin^2\\theta + \\cos^2\\theta = 1',
          description: 'Fundamental trigonometric identity',
          variables: 'Valid for all angles θ'
        }
      ]
    },
    {
      category: 'Statistics',
      formulas: [
        {
          name: 'Mean (Grouped Data)',
          formula: '\\bar{x} = \\frac{\\sum f_i x_i}{\\sum f_i}',
          description: 'Mean of grouped frequency distribution',
          variables: 'fᵢ = frequency, xᵢ = class mark'
        },
        {
          name: 'Mode Formula',
          formula: 'Mode = l + \\frac{f_1 - f_0}{2f_1 - f_0 - f_2} \\times h',
          description: 'Mode for grouped data',
          variables: 'l = lower boundary, f₁ = modal frequency, f₀,f₂ = adjacent frequencies, h = class width'
        }
      ]
    }
  ];

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // optionally filter categories by topic keyword
  const filtered = topic
    ? formulaCategories.filter(c => c.category.toLowerCase().includes(topic.toLowerCase()))
    : formulaCategories;
  const list = filtered.length ? filtered : formulaCategories;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center space-x-3 mb-6">
        <Calculator className="h-8 w-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Formula Reference</h2>
      </div>
      
      <div className="space-y-4">
        {list.map((category) => (
          <div key={category.category} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleCategory(category.category)}
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors duration-200"
            >
              <span className="font-semibold text-gray-800">{category.category}</span>
              {expandedCategories.has(category.category) ? (
                <ChevronUp className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-600" />
              )}
            </button>
            
            {expandedCategories.has(category.category) && (
              <div className="p-4 space-y-4 bg-white">
                {category.formulas.map((formula, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                      <h4 className="font-semibold text-gray-800">{formula.name}</h4>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg mb-2">
                      <MathFormula formula={formula.formula} />
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-1">{formula.description}</p>
                    {formula.variables && (
                      <p className="text-gray-500 text-xs italic">{formula.variables}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormulaReference;