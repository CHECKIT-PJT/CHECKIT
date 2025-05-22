/**
 * 마크다운을 HTML로 변환하는 함수
 * @param markdown 마크다운 텍스트
 * @returns HTML 문자열
 */
export const convertMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return "";

  let html = markdown
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-5 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-6 mb-4">$1</h1>');

  html = html
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold">$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
    .replace(/~~(.*?)~~/gim, '<del class="line-through">$1</del>');

  html = html
    .replace(
      /^\s*\n\* (.*)/gim,
      '<ul class="list-disc pl-5 my-3">\n<li>$1</li>'
    )
    .replace(/^\* (.*)/gim, '<li class="my-1">$1</li>')
    .replace(/^\s*\n- (.*)/gim, '<ul class="list-disc pl-5 my-3">\n<li>$1</li>')
    .replace(/^- (.*)/gim, '<li class="my-1">$1</li>')
    .replace(
      /^\s*\n([0-9]+)\. (.*)/gim,
      '<ol class="list-decimal pl-5 my-3">\n<li>$2</li>'
    )
    .replace(/^([0-9]+)\. (.*)/gim, '<li class="my-1">$2</li>');

  html = html.replace(
    /```([\s\S]*?)```/gim,
    '<pre class="bg-gray-100 p-3 rounded-md my-4 overflow-auto text-sm font-mono"><code>$1</code></pre>'
  );

  html = html.replace(
    /`(.*?)`/gim,
    '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>'
  );

  html = html.replace(
    /\[(.*?)\]\((.*?)\)/gim,
    '<a href="$2" class="text-blue-600 hover:underline">$1</a>'
  );

  html = html.replace(
    /!\[(.*?)\]\((.*?)\)/gim,
    '<img alt="$1" src="$2" class="max-w-full h-auto my-4 rounded" />'
  );

  html = html.replace(
    /^\s*-{3,}\s*$/gim,
    '<hr class="my-6 border-t border-gray-300" />'
  );

  html = html.replace(
    /^> (.*$)/gim,
    '<blockquote class="pl-4 border-l-4 border-gray-300 italic my-4">$1</blockquote>'
  );

  html = html.replace(/\n$/gim, "<br />");

  html = html.replace(/^(?!<[a-z])(.*)/gim, '<p class="my-2">$1</p>');

  return html;
};
