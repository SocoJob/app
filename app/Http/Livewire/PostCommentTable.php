<?php

namespace App\Http\Livewire;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Rappasoft\LaravelLivewireTables\DataTableComponent;
use Rappasoft\LaravelLivewireTables\Views\Column;
use App\Models\PostComment;

class PostCommentTable extends LivewireTableComponent
{
    protected $model = PostComment::class;

    public function configure(): void
    {
        $this->setPrimaryKey('id');

        $this->setDefaultSort('created_at', 'desc');

        $this->setThAttributes(function (Column $column) {
            return [
                'class' => 'text-center',
            ];
        });

        $this->setTdAttributes(function (Column $column, $row, $columnIndex, $rowIndex) {
            if ($columnIndex == '4') {
                return [
                    'class' => 'text-center',
                    'width' => '15%'
                ];
            }
            if ($columnIndex == '0') {
                return [
                    'width' => '20%'
                ];
            }

            return [];
        });

        $this->setTableAttributes([
            'default' => false,
            'class' => 'table table-striped',
        ]);

        $this->setQueryStringStatus(false);
    }

    public function columns(): array
    {
        return [
            Column::make( __('messages.post.post'), "post_id")
                ->sortable()
                ->view('post_comments.table_components.post'),
            Column::make(__('messages.user.user_name'), "name")
                ->sortable()
                ->searchable()
                ->view('post_comments.table_components.username'),
            Column::make(__('messages.post.comment'), "comment")
                ->sortable()
                ->searchable()
                ->view('post_comments.table_components.comment'),
            Column::make(__('messages.common.created_on'), "created_at")
                ->sortable()
                ->view('post_comments.table_components.created_at'),
            Column::make(__('messages.common.action'), "id")
                ->view('post_comments.table_components.action_button'),
        ];
    }
    public function builder(): Builder
    {
        $query = PostComment::query()->with('post', 'user')->select('post_comments.*');

        return $query;
    }
}
