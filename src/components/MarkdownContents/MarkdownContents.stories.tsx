import type { Meta, StoryObj } from '@storybook/react';
import { MarkdownContents } from './.';

const meta = {
  component: MarkdownContents,
} satisfies Meta<typeof MarkdownContents>;

export default meta;

type Story = StoryObj<typeof MarkdownContents>;

const markdown = `
  # 🐱ねこの種類🐱
  - 🐈 マンチカン
  - 😺 スコティッシュ・フォールド
  - 😻 チンチラシルバー
  - 🐈‍⬛ ロシアンブルー
  # 🐱ねこの好きな物🐱
  - ちゅーる
  - マタタビ
  - お昼寝
`;

export const Default: Story = {
  args: { markdown },
};
