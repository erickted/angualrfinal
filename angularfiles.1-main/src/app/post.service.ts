import { Injectable } from '@angular/core';
import { BehaviorSubject,Observable,tap} from 'rxjs';
import { Post } from './post.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private posts: Post[] = [];
  private postsUpdated = new BehaviorSubject<Post[]>([]);
  private apiUrl = 'http://localhost:5000/api/posts';
  getPost: any;

  constructor(private http: HttpClient) {
    this.fetchPosts();
  }

  fetchPosts() {
    this.http.get<{ message: string; posts: Post[] }>(this.apiUrl).subscribe(data => {
      this.posts = data.posts;
      this.postsUpdated.next([...this.posts]);
    });
  }

  getPosts() {
    return [...this.posts];
  }
  getPostUpdateListener(){
      return this.postsUpdated.asObservable();
  
  }

  addPost(title: string, content: string, imageUrl: string) {
    const post: Post = { _id: '', title: title, content: content, imageUrl:imageUrl};
    this.http.post<{ message: string }>(this.apiUrl, post).subscribe((responseData) => {
       console.log(responseData.message);
       this.posts.push(post);
       this.postsUpdated.next([...this.posts]);
       this.fetchPosts();
    });
   }
   updatePost(postId: string, postData: any): Observable<any> {
    const url = `http://localhost:5000/api/posts/${postId}`;
    return this.http.put(url, postData).pipe(
        tap(() => {
            // Assuming you want to update the posts array here
            // You might need to fetch the updated posts from the server
            // For demonstration, I'm just updating the posts array with the new postData
            const updatedPosts = this.posts.map(post => post._id === postId ? {...post, ...postData} : post);
            this.posts = updatedPosts;
            this.postsUpdated.next([...this.posts]);
        })
    );
}
// Add this method to your existing PostService
deletePost(postId: string) {
  this.posts = this.posts.filter(post => post._id !== postId);
   // Update the postsUpdated subject
   this.postsUpdated.next([...this.posts]);
  return this.http.delete(`${this.apiUrl}/${postId}`);
   // Remove the deleted post from the posts array
   
 }

  }