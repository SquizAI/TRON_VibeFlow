import { Group, Text, Image, Rect } from 'react-konva'
import { useEffect, useState } from 'react'
import { NoteComponent as NoteComponentType } from '../../../types/canvas'

// Text styles for rich text rendering
type TextStyle = {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  color?: string
  size?: number
  heading?: 1 | 2 | 3 | false
}

type FormattedTextChunk = {
  text: string
  style: TextStyle
}

type TextLine = {
  chunks: FormattedTextChunk[]
  indent: number
  type: 'paragraph' | 'bullet' | 'number' | 'checkbox' | 'code' | 'quote'
  checked?: boolean
  number?: number
}

// Template definitions
type NoteTemplate = {
  id: string
  name: string
  icon: string
  iconUrl: string
  sections: {
    title: string
    content: string
  }[]
}

const TEMPLATES: Record<string, NoteTemplate> = {
  meeting: {
    id: 'meeting',
    name: 'Meeting Notes',
    icon: '📋',
    iconUrl: '/icons/meeting.svg',
    sections: [
      { title: 'Attendees', content: '• Person 1\n• Person 2' },
      { title: 'Agenda', content: '1. Topic 1\n2. Topic 2' },
      { title: 'Discussion', content: '' },
      { title: 'Action Items', content: '- [ ] Task 1\n- [ ] Task 2' },
    ]
  },
  research: {
    id: 'research',
    name: 'Research Notes',
    icon: '🔍',
    iconUrl: '/icons/research.svg',
    sections: [
      { title: 'Topic', content: '' },
      { title: 'Key Points', content: '• Point 1\n• Point 2' },
      { title: 'References', content: '1. ' },
      { title: 'Questions', content: '?' },
    ]
  },
  decision: {
    id: 'decision',
    name: 'Decision Doc',
    icon: '⚖️',
    iconUrl: '/icons/decision.svg',
    sections: [
      { title: 'Context', content: '' },
      { title: 'Pros', content: '• ' },
      { title: 'Cons', content: '• ' },
      { title: 'Decision', content: '' },
    ]
  }
}

interface NoteComponentProps {
  data: NoteComponentType
}

const NoteComponent = ({ data }: NoteComponentProps) => {
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null)
  const containerWidth = data.width
  const padding = 15
  const contentWidth = containerWidth - (padding * 2)
  
  // Templates will be implemented in the next phase
  // Note: template detection will check data.template or content with 'template:' prefix
  
  // Parse rich text format
  const [formattedLines, setFormattedLines] = useState<TextLine[]>([])
  const [sections, setSections] = useState<{title: string, content: TextLine[]}[]>([])
  
  // Parse content into rich text format
  useEffect(() => {
    const parseRichText = () => {
      // Check if content is template-based
      const isTemplateContent = data.content.startsWith('template:')
      
      if (isTemplateContent) {
        const templateId = data.content.split(':')[1]?.trim()
        const template = TEMPLATES[templateId]
        
        if (template) {
          const parsedSections = template.sections.map(section => ({
            title: section.title,
            content: parseTextIntoLines(section.content, contentWidth)
          }))
          
          setSections(parsedSections)
          setFormattedLines([])
          return
        }
      }
      
      // Regular content parsing
      const parsedLines = parseTextIntoLines(data.content, contentWidth)
      setFormattedLines(parsedLines)
      setSections([])
    }
    
    parseRichText()
  }, [data.content, contentWidth])
  
  // Parse text into formatted lines with styling
  const parseTextIntoLines = (text: string, maxWidth: number): TextLine[] => {
    const rawLines = text.split('\n')
    const result: TextLine[] = []
    
    let listNumbering = 0
    
    rawLines.forEach(line => {
      // Determine line type and indentation
      let type: TextLine['type'] = 'paragraph'
      let indent = 0
      let checked = false
      let number = 0
      let lineText = line
      
      // Check for bullet points
      if (line.trim().match(/^[•\-\*]\s/)) {
        type = 'bullet'
        indent = line.indexOf(line.trim()[0])
        lineText = line.trim().substring(2)
      } 
      // Check for numbered lists
      else if (line.trim().match(/^\d+\.\s/)) {
        type = 'number'
        indent = line.indexOf(line.trim()[0])
        const match = line.trim().match(/^(\d+)\.\s/) 
        number = match ? parseInt(match[1]) : ++listNumbering
        lineText = line.trim().replace(/^\d+\.\s/, '')
      }
      // Check for checkboxes
      else if (line.trim().match(/^-\s\[[ x]\]\s/)) {
        type = 'checkbox'
        indent = line.indexOf('-')
        checked = line.includes('[x]')
        lineText = line.trim().replace(/^-\s\[[ x]\]\s/, '')
      }
      // Check for code blocks
      else if (line.trim().startsWith('```')) {
        type = 'code'
        lineText = line.trim().replace(/^```/, '')
      }
      // Check for quotes
      else if (line.trim().startsWith('>')) {
        type = 'quote'
        indent = line.indexOf('>')
        lineText = line.trim().substring(1).trim()
      }
      
      // Parse text for formatting
      const chunks: FormattedTextChunk[] = parseFormatting(lineText)
      
      // Create formatted line
      const formattedLine: TextLine = {
        chunks,
        indent,
        type,
        ...(type === 'checkbox' && { checked }),
        ...(type === 'number' && { number })
      }
      
      // Word wrap long lines
      const wrappedLines = wrapLine(formattedLine, maxWidth)
      result.push(...wrappedLines)
    })
    
    return result
  }
  
  // Parse text formatting like bold, italic, etc.
  const parseFormatting = (text: string): FormattedTextChunk[] => {
    const chunks: FormattedTextChunk[] = []
    let currentText = ''
    let currentStyle: TextStyle = {}
    
    // Simple parsing for demonstration - in production would use a more robust parser
    const chars = text.split('')
    let i = 0
    
    while (i < chars.length) {
      // Bold text with **
      if (chars[i] === '*' && chars[i+1] === '*') {
        // Push current chunk
        if (currentText) {
          chunks.push({ text: currentText, style: {...currentStyle} })
          currentText = ''
        }
        
        // Toggle bold
        currentStyle.bold = !currentStyle.bold
        i += 2
        continue
      }
      
      // Italic text with _
      if (chars[i] === '_') {
        // Push current chunk
        if (currentText) {
          chunks.push({ text: currentText, style: {...currentStyle} })
          currentText = ''
        }
        
        // Toggle italic
        currentStyle.italic = !currentStyle.italic
        i += 1
        continue
      }
      
      // Add character to current text
      currentText += chars[i]
      i++
    }
    
    // Add final chunk
    if (currentText) {
      chunks.push({ text: currentText, style: currentStyle })
    }
    
    return chunks.length ? chunks : [{ text, style: {} }]
  }
  
  // Wrap long lines while maintaining formatting
  const wrapLine = (line: TextLine, _maxWidth: number): TextLine[] => {
    const result: TextLine[] = [line]
    
    // For simplicity in this implementation, we're not implementing complex wrapping
    // A production version would need to measure text width more accurately and split chunks
    
    return result
  }
  
  // Load lock icon
  useEffect(() => {
    const img = new window.Image()
    img.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItbG9jayI+PHJlY3QgeD0iMyIgeT0iMTEiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxMSIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTciIDExVjdhNSA1IDAgMCAxIDEwIDB2NCI+PC9wYXRoPjwvc3ZnPg=='
    img.onload = () => setImageObj(img)
  }, [])
  
  return (
    <Group>
      {/* Note header with template icon or title */}
      <Rect
        fill={data.color + '20'} // Add transparency
        cornerRadius={5}
        width={data.width - 30}
        height={40}
        x={15}
        y={15}
      />
      
      {/* Note title with royal blue accent */}
      <Text
        text={data.title || 'Untitled Note'}
        fontSize={16}
        fontFamily="Inter, sans-serif"
        fill="#FFFFFF"
        x={padding + 5}
        y={25}
        fontStyle="bold"
      />
      
      {/* Template indicator if using a template */}
      {data.content.startsWith('template:') && (
        <Text
          text={TEMPLATES[data.content.split(':')[1]?.trim()]?.icon || '📝'}
          fontSize={18}
          x={padding + 180}
          y={25}
        />
      )}
      
      {/* Lock icon for secure notes */}
      {data.isLocked && imageObj && (
        <Image
          image={imageObj}
          width={18}
          height={18}
          x={data.width - 40}
          y={26}
          opacity={0.8}
        />
      )}
      
      {/* Content area - Template sections */}
      {sections.length > 0 && (
        <Group x={padding} y={70}>
          {sections.map((section, sectionIndex) => {
            // Calculate vertical position based on previous sections
            const prevSectionHeight = sections
              .slice(0, sectionIndex)
              .reduce((acc, s) => acc + 30 + (s.content.length * 22), 0)
            
            return (
              <Group key={`section-${sectionIndex}`} y={prevSectionHeight}>
                {/* Section title */}
                <Rect
                  fill="rgba(65, 105, 225, 0.15)"
                  cornerRadius={3}
                  width={contentWidth}
                  height={24}
                />
                <Text
                  text={section.title}
                  fontSize={14}
                  fontFamily="Inter, sans-serif"
                  fill="#4169E1"
                  fontStyle="bold"
                  x={5}
                  y={5}
                />
                
                {/* Section content */}
                <Group y={30}>
                  {section.content.map((line, lineIndex) => renderTextLine(line, lineIndex, contentWidth))}
                </Group>
              </Group>
            )
          })}
        </Group>
      )}
      
      {/* Content area - Regular formatted content */}
      {sections.length === 0 && (
        <Group x={padding} y={70}>
          {formattedLines.map((line, i) => renderTextLine(line, i, contentWidth))}
        </Group>
      )}
      
      {/* Tags with royal blue accents */}
      <Group x={padding} y={data.height - 40}>
        {data.tags && data.tags.map((tag, i) => {
          const tagWidth = tag.length * 8 + 16 // Approximate width based on text length
          return (
            <Group key={`tag-${i}`} x={i * (tagWidth + 8)}>
              <Rect
                width={tagWidth}
                height={24}
                fill="rgba(65, 105, 225, 0.2)"
                cornerRadius={12}
              />
              <Text
                text={tag}
                fontSize={12}
                x={8}
                y={6}
                fill="white"
              />
            </Group>
          )
        })}
      </Group>
    </Group>
  )
}

// Helper function to render a text line with formatting
const renderTextLine = (line: TextLine, lineIndex: number, _contentWidth: number) => {
  const lineHeight = 22
  const yPosition = lineIndex * lineHeight
  
  // Render different line types
  return (
    <Group key={`line-${lineIndex}`} y={yPosition} x={line.indent}>
      {/* Render line type markers */}
      {line.type === 'bullet' && (
        <Text
          text="•"
          fontSize={14}
          fontFamily="Inter, sans-serif"
          fill="#4169E1"
          fontStyle="bold"
          x={-15}
        />
      )}
      
      {line.type === 'number' && (
        <Text
          text={`${line.number}.`}
          fontSize={14}
          fontFamily="Inter, sans-serif"
          fill="#4169E1"
          x={-20}
        />
      )}
      
      {line.type === 'checkbox' && (
        <Group x={-20}>
          <Rect
            width={14}
            height={14}
            stroke="#4169E1"
            strokeWidth={1}
            cornerRadius={2}
            fill={line.checked ? 'rgba(65, 105, 225, 0.3)' : 'transparent'}
          />
          {line.checked && (
            <Text
              text="✓"
              fontSize={12}
              fill="#4169E1"
              x={2}
              y={-1}
            />
          )}
        </Group>
      )}
      
      {line.type === 'quote' && (
        <Rect
          width={3}
          height={lineHeight}
          fill="#4169E1"
          x={-10}
        />
      )}
      
      {/* Render text chunks with formatting */}
      <Group>
        {line.chunks.map((chunk, chunkIndex) => {
          // Calculate x position based on previous chunks in this line
          const prevChunksWidth = line.chunks
            .slice(0, chunkIndex)
            .reduce((width, c) => width + (c.text.length * (c.style.size || 14) * 0.6), 0)
          
          return (
            <Text
              key={`chunk-${chunkIndex}`}
              text={chunk.text}
              x={prevChunksWidth}
              fontSize={chunk.style.size || 14}
              fontFamily="Inter, sans-serif"
              fill={chunk.style.color || "white"}
              fontStyle={chunk.style.italic ? "italic" : undefined}
              fontVariant={chunk.style.heading ? "small-caps" : undefined}
              textDecoration={chunk.style.underline ? "underline" : undefined}
              fontWeight={chunk.style.bold ? "bold" : "normal"}
            />
          )
        })}
      </Group>
      
      {/* Code block background */}
      {line.type === 'code' && (
        <Rect
          width={300} // Fixed width for code blocks
          height={lineHeight}
          fill="rgba(0, 0, 0, 0.3)"
          cornerRadius={3}
          x={-5}
          y={-3}
        />
      )}
    </Group>
  )
}



export default NoteComponent
