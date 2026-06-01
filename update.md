# 同步上游 (read-frog)

本项目 fork 自 [read-frog](https://github.com/mengxi-ream/read-frog)（GPLv3）。
本文件记录如何从上游 cherry-pick 更新。

## Remote 约定

- `origin`   → 本仓库（translite）
- `upstream` → read-frog 上游

确认配置：

```bash
git remote -v
# upstream  https://github.com/mengxi-ream/read-frog.git
# origin    <你的仓库地址>
```

若缺失：

```bash
git remote add upstream https://github.com/mengxi-ream/read-frog.git
```

## 拉取上游更新

```bash
git fetch upstream
```

查看上游有哪些本仓库还没有的提交：

```bash
git log --oneline HEAD..upstream/main
```

## Cherry-pick 单个提交

```bash
git cherry-pick <commit-sha>
```

挑一段连续提交（左开右闭）：

```bash
git cherry-pick <old-sha>..<new-sha>
```

## 冲突处理

本项目已 rebrand：包名/品牌 `read-frog` → `translite`，且删减了部分模块
（`.changeset/`、部分 provider、CI 配置等）。cherry-pick 高概率冲突，重点检查：

- 品牌/包名字符串（`read-frog` / `Read Frog` / `readfrog`）
- 已删除的文件 → 上游改动若落在这些文件，直接 `git rm` 跳过
- `package.json` / `wxt.config.ts` 中本地裁剪过的依赖与配置

解决后：

```bash
git add -A
git cherry-pick --continue   # 或 --abort 放弃，--skip 跳过该提交
```

## 验证（每次同步后必跑）

```bash
pnpm install
pnpm type-check
SKIP_FREE_API=true pnpm test
pnpm build
```

## 记录已同步到的位置

每次同步后在下方登记上游 commit，便于下次定位起点：

| 日期 | 同步到上游 commit | 说明 |
| --- | --- | --- |
| 初始 fork | c9b157ad | fork 基线 |
