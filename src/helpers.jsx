import { Typography } from '@mui/material';

export const parseFormattedText = (text) => {
  const lines = text.split('\n').filter((line) => line.trim() !== '');
  const elements = [];
  let currentSection = null;
  let currentList = [];

  lines.forEach((line, index) => {
    if (line.startsWith('**') && line.endsWith(':**')) {
      if (currentSection) {
        elements.push(
          <div key={currentSection.key}>
            {currentSection.title}
            <ul>{currentList}</ul>
          </div>
        );
      }
      currentSection = {
        title: (
          <Typography variant="subtitle2" gutterBottom>
            {line.slice(2, -2)}
          </Typography>
        ),
        key: index,
      };
      currentList = [];
    } else if (line.startsWith('*')) {
      currentList.push(
        <li key={index}>
          <Typography
            variant="body2"
            component="span"
            dangerouslySetInnerHTML={{
              __html: line
                .slice(1)
                .trim()
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
            }}
          />
        </li>
      );
    } else {
      currentList.push(
        <Typography
          key={index}
          variant="body2"
          gutterBottom
          component="span"
          dangerouslySetInnerHTML={{
            __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
          }}
        />
      );
    }
  });

  if (currentSection) {
    elements.push(
      <div key={currentSection.key}>
        {currentSection.title}
        <ul>{currentList}</ul>
      </div>
    );
  }

  return elements;
};
