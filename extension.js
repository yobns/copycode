const vscode = require('vscode');

function activate(context) {
	console.log('Congratulations, your extension "copycode" is now active!');

	let copyOpenFiles = vscode.commands.registerCommand('copycode.copyOpenFiles', async () => {
		const text = await getAllOpenFilesContent();
		await copyToClipboard(text);
	});

	let copyCurrentFile = vscode.commands.registerCommand('copycode.copyCurrentFile', async () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const text = formatContent(editor.document.getText(), editor.document.uri.fsPath);
			await copyToClipboard(text);
		}
	});

	let copyAllFiles = vscode.commands.registerCommand('copycode.copyAllFiles', async () => {
		const text = await getAllWorkspaceFilesContent();
		await copyToClipboard(text);
	});

	context.subscriptions.push(copyOpenFiles);
	context.subscriptions.push(copyCurrentFile);
	context.subscriptions.push(copyAllFiles);

	const copyOpenFilesButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 202);
	copyOpenFilesButton.text = '$(files) Copy Open Files';
	copyOpenFilesButton.command = 'copycode.copyOpenFiles';
	copyOpenFilesButton.show();
	context.subscriptions.push(copyOpenFilesButton);

	const copyCurrentFileButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 201);
	copyCurrentFileButton.text = '$(files) Copy Current File';
	copyCurrentFileButton.command = 'copycode.copyCurrentFile';
	copyCurrentFileButton.show();
	context.subscriptions.push(copyCurrentFileButton);

	const copyAllFilesButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 200);
	copyAllFilesButton.text = '$(files) Copy All Files';
	copyAllFilesButton.command = 'copycode.copyAllFiles';
	copyAllFilesButton.show();
	context.subscriptions.push(copyAllFilesButton);
}

function deactivate() { }

async function getAllOpenFilesContent() {
	const documents = vscode.workspace.textDocuments;
	let content = '';
	const activeEditorPath = vscode.window.activeTextEditor?.document.uri.fsPath;
	for (const document of documents) {
		const filePath = document.uri.fsPath;
		if (filePath !== activeEditorPath) {
			const cleanedPath = filePath.replace(/\.git$/, '');
			const fileContent = document.getText();
			content += `${cleanedPath}\n${fileContent.replace(/\s+/g, '')}\n\n`;
		}
	}
	return content;
}

async function getAllWorkspaceFilesContent() {
	const uris = await vscode.workspace.findFiles('**/*.{js,jsx,ts,tsx,html,css,scss,md}', '**/node_modules/**');
	let content = '';
	for (const uri of uris) {
		const filePath = uri.fsPath;
		const cleanedPath = filePath.replace(/\.git$/, '');
		const document = await vscode.workspace.openTextDocument(uri);
		const fileContent = document.getText();
		content += `${cleanedPath}\n${fileContent.replace(/\s+/g, '')}\n\n`;
	}
	return content;
}

function formatContent(content, path) {
	content = content.replace(/\s+/g, '');
	return `${path}\n${content}`;
}

async function copyToClipboard(text) {
	await vscode.env.clipboard.writeText(text);
	vscode.window.showInformationMessage('Content copied to clipboard');
}

module.exports = {
	activate,
	deactivate
}