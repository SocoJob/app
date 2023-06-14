<?php

namespace App\Http\Livewire;

use Illuminate\Database\Eloquent\Builder;
use Rappasoft\LaravelLivewireTables\DataTableComponent;
use Rappasoft\LaravelLivewireTables\Views\Column;
use App\Models\ReportedToCompany;

class ReportedEmployerTable extends LivewireTableComponent
{
    protected $model = ReportedToCompany::class;

    public function configure(): void
    {
        $this->setPrimaryKey('id');

        $this->setDefaultSort('created_at', 'desc');

        $this->setThAttributes(function (Column $column) {
            return [
                'class' => 'text-center',
            ];
        });

        $this->setTableAttributes([
            'default' => false,
            'class'   => 'table table-striped',
        ]);

        $this->setQueryStringStatus(false);
    }

    public function columns(): array
    {
        return [
            Column::make(__('messages.company.employer_name'), "company.user.first_name")
                ->sortable()
                ->searchable()
                ->view('employer.companies.reported_company_table_components.employer_name'),

            Column::make(__('messages.company.reported_by'), "user.first_name")
                ->sortable()
                ->searchable()
                ->view('employer.companies.reported_company_table_components.reported_by'),

            Column::make(__('messages.company.reported_on'), "created_at")
                ->sortable()
                ->view('employer.companies.reported_company_table_components.reported_on'),

            Column::make(__('messages.common.action'), "id")
                ->view('employer.companies.reported_company_table_components.action_button'),
        ];
    }
    public function builder(): Builder
    {
        $query = ReportedToCompany::with('user', 'company.user')->select('reported_to_companies.*');

        return $query;
    }
}
