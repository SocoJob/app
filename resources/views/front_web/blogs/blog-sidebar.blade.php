<div class="col-lg-4 mt-lg-0 mt-md-5 mt-4 pt-md-0 pt-2">
    @if($blogCategories->count())
        <div class="Categories br-10 px-40 bg-gray mb-40">
            <h5 class="fs-18 text-secondary mb-4 ">
                {{ __('web.post_menu.categories') }}</h5>
            @foreach($blogCategories as $blogCategory)
                @if($blogCategory->post_assign_categories_count > 0)
                    <p>
                        <a class="fs-14 text-gray" href="{{ route('front.blog.category',$blogCategory->id)  }}">
                            {{ ($blogCategory->post_assign_categories_count > 0) ? html_entity_decode($blogCategory->name): ''}}
                            {{($blogCategory->post_assign_categories_count > 0)? '('.$blogCategory->post_assign_categories_count.')':''}}
                        </a>
                    </p>
                @endif
            @endforeach
        </div>
    @endif
    <div class="recent-post-section br-10 px-40 bg-gray">
        <h5 class="fs-18 text-secondary mb-4 ">
            {{ __('web.web_blog.recent_posts') }}</h5>
        @foreach($popularBlogs as $popularBlog)
            <div class="recent-post d-flex {{$loop->last?'':'mb-40'}}">
                <div class="img">
                    <a href="{{ route('front.posts.details',$popularBlog->id) }}">
                        <img src="{{ !empty($popularBlog->blog_image_url)?$popularBlog->blog_image_url:asset('assets/img/infyom-logo.png') }}">
                    </a>
                </div>
                <div class="desc ms-4">
                    <p class="mb-0">
                        <a href="{{ route('front.posts.details',$popularBlog->id) }}" class="fs-14 text-secondary">
                            {{ html_entity_decode($popularBlog->title) }}
                        </a>
                    </p>
                    <span class="fs-14 text-gray">{{ \Carbon\Carbon::parse($popularBlog->created_at)->translatedFormat('M jS Y')}}</span>
                </div>
            </div>
        @endforeach
    </div>
</div>
