---
description: コーディングフローのルール
---

# コーディングフローのルール

## コーディング開始時

- worktree を作成して他の Agent の作業に影響を与えないようにすること
- worktree はリポジトリのルートディレクトリ直下（例：`git worktree add ./z-<ブランチ名> ...`）に作成すること
  - リポジトリの外（例：`../z-<ブランチ名>` のような親ディレクトリ）に作成してはならない
- worktree のディレクトリ名は `z-<ブランチ名>` のように，ブランチ名の先頭に z- を付けたものにすること

### ブランチ

- 新しい機能や修正を行う場合は，基本新しいブランチを作成すること
- ブランチ作成時に main ブランチが最新の状態であることを確認すること
- main ブランチからブランチを切ること
- ブランチ名は issue がある場合は `issues/<issue番号>-<prefix>-<description>`，ない場合は `<prefix>-<description>` とすること
- ブランチ名は小文字の英数字とハイフン(-)のみを使用すること
- `<prefix>` は @.vscode/.copilot-commit-message-instructions.md を参照すること
- `<description>` は修正内容や追加する機能の概要を簡潔に表すこと

## コーディング中

### コミット

- 1対応1コミットすること
- Revert したときに問題なく動作すること
- 過去のコミットの修正をする場合，プッシュ前ならばコミットを改変して履歴を綺麗に保つこと
- コミットメッセージは @.vscode/.copilot-commit-message-instructions.md を参照すること

### コードレビュー

- 大規模であると判断した場合は，プッシュ前に review skill を使用してコードレビューを行うこと
- コードレビューの結果，修正が必要な場合は修正し，修正後に再度コードレビューを行うこと
- 人が都度指示して実装している場合は，指示がない限りコードレビューを行わないこと

### プッシュ

- コミット後は，作業ブランチをリモートにプッシュすること

### PR

- 対応が完了したら，作業ブランチから main ブランチに対して PR を作成すること
- `api/`・`web/`・`share/` 配下を変更した場合，push の前に `pnpm run ci:local` を実行すること
  - 成功すると HEAD のコミットが amend され，`CI-Local` のトレーラーが付き，PR の CI の js ジョブがスキップされるため
  - コミットすると `.githooks/post-commit` が裏で同じ検査を始めるため，`pnpm run ci:local` はその終了を待ち，検査済みならすぐに終了する
  - 裏の検査は push すると `.githooks/pre-push` で止まり，トレーラーなしで push される
  - push 済みのコミットでは，force push を避けるため `pnpm run ci:local` はトレーラーを付けずに終了する
  - rebase などで tree が変わった場合は，もう一度 `pnpm run ci:local` を実行すること
- PR のタイトルは変更内容を簡潔に表すこと
- PR はテンプレートに従って作成すること
- PR 作成時に，PR の assignee を自分に設定すること
- PR 作成時に，PR の label を対応する issue と同じものにすること
  - 対応する issue がない場合は，[issue 作成のルール](issue.md#label) の label と対象の対応に従うこと
- PR 作成時に，PR を project「Activity Agora」（`kajiLabTeam/11`）に追加すること
- PR には milestone を設定しないこと

## PRマージ完了後

- PR マージ完了後は，必ず main ブランチを最新の状態にすること
- main ブランチを最新の状態にした後，ローカルおよびリモートにある作業ブランチを削除すること
- 対象の worktree を削除すること
- 関連する issue がある場合は，PR マージ完了後に issue をクローズすること
