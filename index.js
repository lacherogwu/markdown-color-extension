import fs from 'fs/promises';
import { marked } from 'marked';

const mdContent = await fs.readFile('./sample.md', 'utf-8');

const colors = {
	extensions: [
		{
			name: 'color',
			level: 'inline',
			start(src) {
				return src.match(/%:/)?.index;
			},
			tokenizer(src) {
				const rule = /%:([#\w\d-]+):([^%]+)%/;
				const match = rule.exec(src);
				if (match) {
					const startIndex = src.indexOf('%:');

					const output = {
						type: 'color',
						raw: match[0],
						color: match[1],
						content: this.lexer.inlineTokens(match[2].trim()),
						plainText: null,
					};
					if (startIndex > 0) {
						const raw = src.slice(0, startIndex);
						output.plainText = this.lexer.inlineTokens(raw);
						output.raw += raw;
					}
					return output;
				}
			},
			renderer(token) {
				if (token.color.startsWith('#')) {
					token.color = `[${token.color}]`;
				}
				let html = '';

				if (token.plainText) {
					html += this.parser.parseInline(token.plainText);
				}
				html += `<span class="text-${token.color}">${this.parser.parseInline(token.content)}</span>`;

				return html;
			},
		},
	],
};

marked.use(colors);

let html = '<script src="https://cdn.tailwindcss.com"></script>\n';
html += '<link rel="stylesheet" href="styles.css">\n\n';
html += marked.parse(mdContent);

await fs.writeFile('index.html', html);
