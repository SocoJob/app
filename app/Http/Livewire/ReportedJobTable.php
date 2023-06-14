<?php

namespace App\Http\Livewire;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Rappasoft\LaravelLivewireTables\DataTableComponent;
use Rappasoft\LaravelLivewireTables\Views\Column;
use App\Models\ReportedJob;

class ReportedJobTable extends LivewireTableComponent
{
    protected $model = ReportedJob::class;

    public function configure(): void
    {
        $this->setPrimaryKey('id');

        $this->setThAttributes(function (Column $column) {
            return [
                'class' => 'text-center',
            ];
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
            Column::make(__('messages.reported_jobs'), "job.job_title")
                ->sortable()
                ->searchable()
                ->view('employer.jobs.reported_job_table_components.reported_jobs'),
            Column::make(__('messages.company.reported_by'), "user.first_name")
                ->sortable()
                ->searchable()
                ->view('employer.jobs.reported_job_table_components.reported_by'),
            Column::make(__('messages.company.reported_on'), "note")
                ->sortable()
                ->view('employer.jobs.reported_job_table_components.reported_on'),
            Column::make(__('messages.common.action'), "id")
                ->view('employer.jobs.reported_job_table_components.action_button')

        ];
    }
    public function builder($input = []): Builder
    {
        $query = ReportedJob::with(['user.candidate', 'job.company', 'user' => function ($query) {
            $query->without(['media', 'country', 'state', 'city']);
        }])->select('reported_jobs.*');

        $query->when(isset($input['created_at']) && $input['created_at'] != '', function (Builder $q) use ($input) {
            $q->whereMonth('reported_jobs.created_at', '=', $input['created_at']);
        });

        return $query;
    }
}
