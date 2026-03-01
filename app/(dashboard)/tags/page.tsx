export const dynamic = 'force-dynamic';

import { getTags } from '@/actions/tags';
import { TagList } from '@/components/tags/tag-list';

export default async function TagsPage() {
  const tags = await getTags();
  return <TagList tags={tags} />;
}
