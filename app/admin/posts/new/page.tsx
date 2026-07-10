import { PostEditor } from "@/components/admin/PostEditor";

export default function NewPostPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold mb-8">Create new post</h1>
      <PostEditor />
    </div>
  );
}
