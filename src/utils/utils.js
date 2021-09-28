export const cleanFilename = (filename) => {
  const cleanedFilename = filename
    .replace(/\s|-/g, '_')
    .replace(/[^A-Za-z0-9_]/g, '')
    .replace(/__+/g, '_')
    .replace(/^_|_$/g, '');
  return cleanedFilename;
};

export const getStateFromUrl = async (url) => {
  const response = await fetch('/GetStateFromImage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  }).then((res) => res.json());

  return response;
};
