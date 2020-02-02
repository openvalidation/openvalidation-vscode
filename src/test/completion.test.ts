/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as assert from 'assert';
import * as vscode from 'vscode';
import { activate, getDocUri } from './helper';

describe('Should do completion', () => {
	const docUri = getDocUri('sample.ov');

	it('Global completion items in empty space', async () => {
		await testCompletion(docUri, new vscode.Position(5, 0), {
			items: [
				{ label: 'IF', kind: vscode.CompletionItemKind.Keyword },
				{ label: 'Rule', kind: vscode.CompletionItemKind.Snippet },
				{ label: 'Variable', kind: vscode.CompletionItemKind.Snippet },
				{ label: 'Constrained Rule', kind: vscode.CompletionItemKind.Snippet }
			]
		});
	});
});

async function testCompletion(
	docUri: vscode.Uri,
	position: vscode.Position,
	expectedCompletionList: vscode.CompletionList
) {
	await activate(docUri);

	// Executing the command `vscode.executeCompletionItemProvider` to simulate triggering completion
	const actualCompletionList = (await vscode.commands.executeCommand(
		'vscode.executeCompletionItemProvider',
		docUri,
		position
	)) as vscode.CompletionList;

	assert.equal(actualCompletionList.items.length, expectedCompletionList.items.length);
	expectedCompletionList.items.forEach((expectedItem, i) => {
		const actualItem = actualCompletionList.items[i];
		assert.equal(actualItem.label, expectedItem.label);
		assert.equal(actualItem.kind, expectedItem.kind);
	});
}
