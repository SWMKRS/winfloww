import { useState } from 'react';
import { Card, Input, Select, Slider, Switch, Space, Typography } from 'antd';

import './HelpSupport.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// dev-configurable fonts - mix of system fonts and google fonts
const FONTS_TO_COMPARE = [
  'Inter',
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'sans-serif',
  'Roboto',
  'Helvetica Neue',
  'Arial',
];

function HelpSupport() {
  const [sampleText, setSampleText] = useState('The quick brown fox jumps over the lazy dog');
  const [fontSize, setFontSize] = useState(16);
  const [fontWeight, setFontWeight] = useState(400);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [textDecoration, setTextDecoration] = useState('none');
  const [fontStyle, setFontStyle] = useState('normal');
  const [textTransform, setTextTransform] = useState('none');

  return (
    <div className="help-support">
      <div className="help-support-content">
        {/* controls panel */}
        <Card title="Style Controls" className="controls-card">
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div className="control-group">
              <Text strong>Sample Text</Text>
              <TextArea
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                placeholder="Enter text to compare fonts..."
                rows={3}
                style={{ resize: 'none' }}
              />
            </div>

            <div className="control-group">
              <Text strong>Font Size</Text>
              <Slider
                min={8}
                max={72}
                value={fontSize}
                onChange={setFontSize}
                marks={{ 8: '8px', 24: '24px', 48: '48px', 72: '72px' }}
              />
            </div>

            <div className="control-group">
              <Text strong>Font Weight</Text>
              <Select
                value={fontWeight}
                onChange={setFontWeight}
                style={{ width: '100%' }}
              >
                <Option value={100}>100 - Thin</Option>
                <Option value={200}>200 - Extra Light</Option>
                <Option value={300}>300 - Light</Option>
                <Option value={400}>400 - Normal</Option>
                <Option value={500}>500 - Medium</Option>
                <Option value={600}>600 - Semi Bold</Option>
                <Option value={700}>700 - Bold</Option>
                <Option value={800}>800 - Extra Bold</Option>
                <Option value={900}>900 - Black</Option>
              </Select>
            </div>

            <div className="control-group">
              <Text strong>Letter Spacing</Text>
              <Slider
                min={-2}
                max={5}
                step={0.1}
                value={letterSpacing}
                onChange={setLetterSpacing}
                marks={{ '-2': '-2px', '0': '0px', '2': '2px', '5': '5px' }}
              />
            </div>

            <div className="control-group">
              <Text strong>Line Height</Text>
              <Slider
                min={1}
                max={3}
                step={0.1}
                value={lineHeight}
                onChange={setLineHeight}
                marks={{ '1': '1x', '1.5': '1.5x', '2': '2x', '3': '3x' }}
              />
            </div>

            <div className="control-group">
              <Text strong>Text Decoration</Text>
              <Select
                value={textDecoration}
                onChange={setTextDecoration}
                style={{ width: '100%' }}
              >
                <Option value="none">None</Option>
                <Option value="underline">Underline</Option>
                <Option value="overline">Overline</Option>
                <Option value="line-through">Strikethrough</Option>
              </Select>
            </div>

            <div className="control-group">
              <Text strong>Font Style</Text>
              <Select
                value={fontStyle}
                onChange={setFontStyle}
                style={{ width: '100%' }}
              >
                <Option value="normal">Normal</Option>
                <Option value="italic">Italic</Option>
                <Option value="oblique">Oblique</Option>
              </Select>
            </div>

            <div className="control-group">
              <Text strong>Text Transform</Text>
              <Select
                value={textTransform}
                onChange={setTextTransform}
                style={{ width: '100%' }}
              >
                <Option value="none">None</Option>
                <Option value="uppercase">Uppercase</Option>
                <Option value="lowercase">Lowercase</Option>
                <Option value="capitalize">Capitalize</Option>
              </Select>
            </div>
          </Space>
        </Card>

        {/* font comparison display */}
        <Card title="Font Comparison" className="comparison-card">
          <div className="font-comparison-container">
            {FONTS_TO_COMPARE.map((font, index) => {
              // extract clean font name for display
              const fontName = font.split(',')[0].replace(/['"]/g, '');
              return (
                <div key={font} className="font-sample">
                  <div className="font-label">
                    <Text code>{fontName}</Text>
                  </div>
                  <div
                    className="font-text"
                    style={{
                      fontFamily: font,
                      fontSize: `${fontSize}px`,
                      fontWeight: fontWeight,
                      letterSpacing: `${letterSpacing}px`,
                      lineHeight: lineHeight,
                      textDecoration: textDecoration,
                      fontStyle: fontStyle,
                      textTransform: textTransform
                    }}
                  >
                    {sampleText}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default HelpSupport;
