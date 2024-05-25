import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Post } from '../post.model';
import { PostService } from '../post.service';


@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css'],
})
export class PostCreateComponent {
  enteredTitle = '';
  enteredContent = '';
  imageUrlToPreview = '';

  constructor(private postService: PostService) {}

  onAddPost(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.postService.addPost(form.value.title, form.value.content,form.value.imageUrl);
    form.resetForm();
  }

  previewImage(event: any) {
    const file = event.target.files[0];
    if (file) {
       const reader = new FileReader();
       reader.onload = (e: any) => {
         this.imageUrlToPreview = e.target.result;
       };
       reader.readAsDataURL(file);
    }
   }
}