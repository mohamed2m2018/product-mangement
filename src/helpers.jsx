import { marked } from 'marked';

export const parseFormattedText = (text) => {
  const html = marked(text);
  const htmlWithTypography = html.replace(/<p>(.*?)<\/p>/g, (_, content) => (
    `<Typography variant="body2" gutterBottom component="div">${content}</Typography>`
  ))
  .replace(/<h1>(.*?)<\/h1>/g, (_, content) => (
    `<Typography variant="h4" gutterBottom component="div">${content}</Typography>`
  ))
  .replace(/<h2>(.*?)<\/h2>/g, (_, content) => (
    `<Typography variant="h5" gutterBottom component="div">${content}</Typography>`
  ))
  .replace(/<h3>(.*?)<\/h3>/g, (_, content) => (
    `<Typography variant="h6" gutterBottom component="div">${content}</Typography>`
  ))
  .replace(/<ul>(.*?)<\/ul>/g, (_, content) => (
    `<Typography component="ul">${content}</Typography>`
  ))
  .replace(/<li>(.*?)<\/li>/g, (_, content) => (
    `<Typography component="li">${content}</Typography>`
  ))
  .replace(/<strong>(.*?)<\/strong>/g, (_, content) => (
    `<Typography component="strong">${content}</Typography>`
  ));

  return <div dangerouslySetInnerHTML={{ __html: htmlWithTypography }} />;
};