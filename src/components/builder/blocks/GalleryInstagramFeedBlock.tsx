import React from 'react';
import { Camera, Heart, MessageCircle, Plus, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const GalleryInstagramFeedBlock = {
  type: 'gallery_instagram_feed',
  category: 'media',
  label: 'Instagram Feed',
  icon: Camera,
  defaultProps: {
    username: '@turisagencias',
    posts: [
      { url: 'https://images.unsplash.com/photo-1542259009477-d625272157b7', likes: '1.2k', comments: '34' },
      { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', likes: '842', comments: '12' },
      { url: 'https://images.unsplash.com/photo-1499678329028-1014352cac0e', likes: '2.1k', comments: '89' },
      { url: 'https://images.unsplash.com/photo-1506744626753-140285375241', likes: '563', comments: '5' },
    ]
  },
  defaultStyles: {
    padding: '48px 0',
    backgroundColor: '#ffffff'
  },
  renderComponent: ({ node }) => {
    const { posts = [], username = '' } = node.props || {};

    return (
      <div style={node.styles} className="w-full flex flex-col items-center">
        {username && (
          <div className="flex items-center gap-2 mb-8">
            <Camera className="h-6 w-6 text-pink-600" />
            <h3 className="font-semibold text-lg text-gray-800">Siga-nos no {username}</h3>
          </div>
        )}
        
        {posts.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-gray-300 rounded bg-gray-50 flex items-center justify-center w-full max-w-4xl min-h-[300px]">
            <div className="text-center text-gray-500">
              <Camera className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p>Adicione imagens ao feed do Instagram</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-4 w-full max-w-5xl mx-auto px-4">
            {posts.map((post: any, idx: number) => (
              <div key={idx} className="aspect-square relative group overflow-hidden bg-gray-100 rounded-sm md:rounded-lg">
                <img 
                  src={post.url} 
                  alt={`Instagram post ${idx}`} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-semibold">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 fill-current" />
                    <span>{post.likes || '0'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 fill-current" />
                    <span>{post.comments || '0'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
  settingsComponent: ({ node, onChange }) => {
    const { posts = [], username = '' } = node.props || {};

    const addPost = () => {
      onChange({ props: { ...node.props, posts: [...posts, { url: '', likes: '0', comments: '0' }] } });
    };

    const updatePost = (index: number, field: string, value: string) => {
      const newPosts = [...posts];
      newPosts[index] = { ...newPosts[index], [field]: value };
      onChange({ props: { ...node.props, posts: newPosts } });
    };

    const removePost = (index: number) => {
      onChange({ props: { ...node.props, posts: posts.filter((_: any, i: number) => i !== index) } });
    };

    return (
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <Label>Username (Ex: @suaagencia)</Label>
          <Input 
            value={username}
            onChange={(e) => onChange({ props: { ...node.props, username: e.target.value } })}
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center justify-between">
            Posts (Imagens)
            <Button variant="ghost" size="sm" onClick={addPost}><Plus className="h-4 w-4" /></Button>
          </Label>
          
          <div className="space-y-3">
            {posts.map((post: any, idx: number) => (
              <div key={idx} className="flex flex-col gap-2 p-2 border rounded relative bg-gray-50">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute top-1 right-1 h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => removePost(idx)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
                <div className="space-y-1 mt-4">
                  <Label className="text-xs">URL da Imagem</Label>
                  <Input 
                    className="h-8 text-sm"
                    value={post.url} 
                    onChange={e => updatePost(idx, 'url', e.target.value)} 
                    placeholder="https://..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Likes</Label>
                    <Input 
                      className="h-8 text-sm"
                      value={post.likes} 
                      onChange={e => updatePost(idx, 'likes', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Comentários</Label>
                    <Input 
                      className="h-8 text-sm"
                      value={post.comments} 
                      onChange={e => updatePost(idx, 'comments', e.target.value)} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
};
