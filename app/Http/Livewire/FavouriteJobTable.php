<?php

namespace App\Http\Livewire;

use Illuminate\Database\Eloquent\Builder;
use Rappasoft\LaravelLivewireTables\DataTableComponent;
use Rappasoft\LaravelLivewireTables\Views\Column;
use App\Models\FavouriteJob;

class FavouriteJobTable extends LivewireTableComponent
{
    protected $model = FavouriteJob::class;

    public function configure(): void
    {
        $this->setPrimaryKey('id');

        $this->setSearchStatus(false);

        $this->setDefaultSort('created_at', 'desc');

        $this->setThAttributes(function (Column $column) {
            if($column->isField('id')){
                return [
                    'class' =>  'text-center p-5'
                ];
            }

            return [
                'class' => 'text-center',
            ];
        });

//        $this->setTableAttributes([
//            'default' => false,
//            'class' => 'table table-default',
//        ]);
        $this->setQueryStringStatus(false);
    }

    public function columns(): array
    {
        return [
            Column::make(__('messages.job.job_title'), "job.job_title")
                ->sortable()
                ->view('candidate.favourite_jobs.table_components.job_title'),
            Column::make(__('messages.user.name'), "job.company.user.first_name")
                ->sortable()
                ->view('candidate.favourite_jobs.table_components.name'),
            Column::make( __('messages.job.created_at'), "created_at")
                ->sortable()
                ->view('candidate.favourite_jobs.table_components.created_at'),
            // Column::make( __('messages.job.job_expiry_date'), "job.job_expiry_date")
            //     ->sortable()
            //     ->view('candidate.favourite_jobs.table_components.job_expiry_date'),
            Column::make(__('messages.common.action'), "id")
                ->view('candidate.favourite_jobs.table_components.action_button'),
        ];
    }
    public function builder(): Builder
    {
        $query = FavouriteJob::with(['job.company.user', 'job','user'])
            ->where('favourite_jobs.user_id', getLoggedInUserId())->select('favourite_jobs.*');

        return $query;
    }
}
