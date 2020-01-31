import * as vscode from "vscode";

export function getDecoratorTypes(): vscode.TextEditorDecorationType[] {
  return [
    variableDecorationType,
    staticNumberDecorationType,
    staticStringDecorationType,
    keywordDecorationType,
    commentDecorationType
  ];
}

export function getSpecificDecorator(
  scope: ScopeEnum
): vscode.TextEditorDecorationType {
  switch (scope) {
    case ScopeEnum.Comment:
      return commentDecorationType;
    case ScopeEnum.Keyword:
      return keywordDecorationType;
    case ScopeEnum.StaticNumber:
      return staticNumberDecorationType;
    case ScopeEnum.StaticString:
      return staticStringDecorationType;
    case ScopeEnum.Variable:
      return variableDecorationType;
    default:
      return defaultDecorationType;
  }
}

let defaultDecorationType = vscode.window.createTextEditorDecorationType({});
let variableDecorationType = vscode.window.createTextEditorDecorationType({
  light: { color: "#267f99ff" },
  dark: { color: "#4ec9b0ff" },
  rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
});
let staticNumberDecorationType = vscode.window.createTextEditorDecorationType({
  light: { color: "#0000ffff" },
  dark: { color: "#569cd6ff" },
  rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
});
let staticStringDecorationType = vscode.window.createTextEditorDecorationType({
  light: { color: "#a31515ff" },
  dark: { color: "#ce9178ff" },
  rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
});
let keywordDecorationType = vscode.window.createTextEditorDecorationType({
  light: { color: "#0000ffff" },
  dark: { color: "#569cd6ff" },
  rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
});
let commentDecorationType = vscode.window.createTextEditorDecorationType({
  light: { color: "#6a9955ff" },
  dark: { color: "#6a9955ff" },
  rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
});

/**
 * Enum for the textmate-scopes we use in syntax-highlighting
 *
 * @export
 * @enum {number}
 */
export enum ScopeEnum {
  Variable = "variable.parameter.ov",
  Keyword = "keyword.ov",
  Comment = "comment.block.ov",

  StaticString = "string.unquoted.ov",
  StaticNumber = "constant.numeric.ov",

  Empty = "semantical.sugar.ov"
}
