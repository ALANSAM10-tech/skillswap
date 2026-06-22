/* global process */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env configuration from server/.env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { OPENAI_API_KEY, GEMINI_API_KEY } = process.env;

/**
 * Intelligent local fallback parser for when no AI API keys are configured.
 * Generates beautiful, tailored roadmaps based on semantic matching of the user's goal.
 */
function localFallbackRoadmap(goal, availableSkills) {
  const goalLower = goal.toLowerCase();
  const roadmap = [];
  let stepCounter = 1;

  // Let's define some standard learning paths based on common campus goals
  const paths = [
    {
      keywords: ['web', 'frontend', 'website', 'app', 'react', 'javascript', 'html', 'css', 'design', 'ui', 'ux'],
      skills: ['Figma', 'UI/UX Design', 'HTML/CSS', 'Javascript', 'React', 'Node.js'],
      descriptions: {
        'Figma': 'Create low-fidelity wireframes and user-experience prototypes for your product interface.',
        'UI/UX Design': 'Define visual hierarchy, color theory, and user journeys for the frontend layout.',
        'HTML/CSS': 'Learn modern CSS layouts, flexbox, grid, and markup structures for web responsiveness.',
        'Javascript': 'Master dynamic logic, DOM manipulation, promises, and modular JS scripting.',
        'React': 'Build reusable UI components, hooks, routing, and clean client-side state management.',
        'Node.js': 'Build backend API servers, handle route requests, and manage database integrations.'
      }
    },
    {
      keywords: ['data', 'python', 'analytics', 'statistics', 'sql', 'database', 'machine learning', 'ml', 'ai'],
      skills: ['SQL', 'Python', 'Statistics'],
      descriptions: {
        'SQL': 'Learn how to query relational tables, perform joins, aggregate data, and design schemas.',
        'Python': 'Learn fundamental variables, loops, lists, and packages like Pandas and NumPy for math operations.',
        'Statistics': 'Understand statistical distributions, variance, linear regressions, and hypothesis testing.'
      }
    },
    {
      keywords: ['video', 'youtube', 'tiktok', 'edit', 'movie', 'film', 'premiere', 'photo', 'photoshop', 'media'],
      skills: ['Photography', 'Photoshop', 'Video Editing', 'Adobe Premiere'],
      descriptions: {
        'Photography': 'Learn camera settings, exposure, framing rules, and capturing high-quality raw media.',
        'Photoshop': 'Edit photos, balance colors, apply layer masks, and create thumbnails/graphics.',
        'Video Editing': 'Master keyframes, audio sync, sound design, and narrative storyboarding techniques.',
        'Adobe Premiere': 'Perform professional video cuts, apply transitions, color grade, and export in 4K resolution.'
      }
    },
    {
      keywords: ['business', 'job', 'interview', 'resume', 'career', 'speak', 'public speaking', 'present'],
      skills: ['Resume Writing', 'Public Speaking', 'Interview Prep'],
      descriptions: {
        'Resume Writing': 'Structure your work experience, write high-impact bullet points, and pass ATS screenings.',
        'Public Speaking': 'Learn voice projection, audience engagement, posture, and pacing for presentations.',
        'Interview Prep': 'Practice behavior response methods, solve technical scenarios, and master negotiation.'
      }
    }
  ];

  // Try to find a matching pre-defined learning path
  let matchedPath = null;
  for (const path of paths) {
    if (path.keywords.some(kw => goalLower.includes(kw))) {
      matchedPath = path;
      break;
    }
  }

  if (matchedPath) {
    // Collect the skills from the path that exist in the campus taxonomy
    const skillsToInclude = matchedPath.skills.filter(s => 
      availableSkills.some(av => av.toLowerCase() === s.toLowerCase())
    );

    skillsToInclude.forEach((skillName) => {
      const canonicalSkill = availableSkills.find(s => s.toLowerCase() === skillName.toLowerCase()) || skillName;
      roadmap.push({
        step: stepCounter++,
        subSkill: canonicalSkill,
        description: matchedPath.descriptions[skillName] || `Master ${canonicalSkill} concepts to progress towards your goal.`
      });
    });
  } else {
    // If no path matches, scan user input word by word to see if any available skill is mentioned
    const mentionedSkills = [];
    availableSkills.forEach(skill => {
      // Look for exact word matches or substring matches for multi-word skills
      const skillPattern = new RegExp(`\\b${skill.toLowerCase()}\\b`, 'i');
      if (skillPattern.test(goalLower) || (skill.length > 3 && goalLower.includes(skill.toLowerCase()))) {
        mentionedSkills.push(skill);
      }
    });

    if (mentionedSkills.length > 0) {
      mentionedSkills.forEach(skill => {
        roadmap.push({
          step: stepCounter++,
          subSkill: skill,
          description: `Learn foundational and advanced concepts of ${skill} from on-campus mentors.`
        });
      });
    } else {
      // Default general learning path if nothing matches
      const defaultSkills = ['Resume Writing', 'Public Speaking', 'Interview Prep'];
      defaultSkills.forEach(skill => {
        const canonicalSkill = availableSkills.find(s => s.toLowerCase() === skill.toLowerCase()) || skill;
        roadmap.push({
          step: stepCounter++,
          subSkill: canonicalSkill,
          description: `Develop ${canonicalSkill} skills to boost your professional portfolio and collaboration.`
        });
      });
    }
  }

  return roadmap;
}

/**
 * Generate Learning Path Roadmap using real OpenAI API (if key available) or local heuristic parser
 */
export async function generateLearningPath(goal, availableSkills) {
  if (!goal) return [];

  // 1. Check if OpenAI API Key is provided
  if (OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an expert academic advisor and career coach. Your task is to break down the user's learning goal into a structured learning roadmap.
              You must only suggest sub-skills that exist in the following predefined campus skills list:
              [${availableSkills.join(', ')}]
              
              Respond with a valid JSON array of objects representing the steps. Maximum 4 steps. Each object must have these exact keys:
              - step (integer starting at 1)
              - subSkill (must match exactly one of the available skills in the list)
              - description (a short one-sentence explanation of what is learned in this step)
              
              Example JSON output:
              [
                { "step": 1, "subSkill": "Figma", "description": "Design wireframes and user layouts." },
                { "step": 2, "subSkill": "React", "description": "Code components and dynamic UI elements." }
              ]
              Do not include markdown code block formatting in your response. Just return the raw JSON.`
            },
            {
              role: 'user',
              content: `Goal: ${goal}`
            }
          ],
          temperature: 0.7
        })
      });

      if (response.ok) {
        const json = await response.json();
        const content = json.choices[0].message.content.trim();
        const parsed = JSON.parse(content.replace(/```json/g, '').replace(/```/g, ''));
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } else {
        console.warn('OpenAI API returned non-OK status. Falling back to local parser.');
      }
    } catch (err) {
      console.error('Error generating roadmap with OpenAI API:', err);
    }
  }

  // 2. Check if Gemini API Key is provided
  if (GEMINI_API_KEY) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an expert academic advisor. Break down the user's goal into a learning roadmap.
              Only use skills from this list: [${availableSkills.join(', ')}]
              Respond with a valid JSON array of objects. Max 4 steps. Keys: "step" (number), "subSkill" (exact name from list), "description" (one sentence).
              Example: [{"step": 1, "subSkill": "Figma", "description": "Design wireframes."}]
              Return only raw JSON, no markdown formatting.
              Goal: ${goal}`
            }]
          }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (response.ok) {
        const json = await response.json();
        const content = json.candidates[0].content.parts[0].text.trim();
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } else {
        console.warn('Gemini API returned non-OK status. Falling back to local parser.');
      }
    } catch (err) {
      console.error('Error generating roadmap with Gemini API:', err);
    }
  }

  // 3. Fallback to Local Smart Parser
  return localFallbackRoadmap(goal, availableSkills);
}
