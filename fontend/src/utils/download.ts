export const downloadFile = (data: BlobPart, filename: string, type = 'text/csv') => {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const exportToCsvMock = (filename: string, headers: string[], rows: any[][]) => {
  const content = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
  downloadFile(content, `${filename}_${new Date().toISOString().substring(0, 10)}.csv`);
};
