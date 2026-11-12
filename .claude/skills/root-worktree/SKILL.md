---
name: root-worktree
description: root worktree に切り替える．
argument-hint: '[worktreeの対象（省略可，例: main）]'
---

このスキルは，現在の作業ブランチが root worktree でない場合に，root worktree に切り替える．

# 手順

## root worktree への切り替え

- 引数（`$ARGUMENTS`）でブランチ名が指定された場合，それを root worktree で checkout する対象として優先すること
- 現在の作業ブランチが root worktree でない場合，`git worktree list` コマンドで root worktree のパスを取得し，`git worktree remove` コマンドで現在の作業ブランチの worktree を削除すること
- root worktree が main ブランチでない場合，ユーザーに「root worktree が main ブランチではありません」と伝えること
- root worktree が main ブランチでない場合に未コミットの変更がなければ，root worktree に切り替えること
- root worktree が main ブランチでない場合に未コミットの変更があれば，ユーザーに「root worktree が main ブランチではありません。未コミットの変更があります。」と伝えて root worktree に切り替えないこと
- root worktree で対象のブランチを checkout すること
