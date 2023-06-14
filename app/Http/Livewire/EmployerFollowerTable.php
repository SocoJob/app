<?php

namespace App\Http\Livewire;

use App\Models\FavouriteCompany;
use Illuminate\Database\Eloquent\Builder;
use Rappasoft\LaravelLivewireTables\Views\Column;

class EmployerFollowerTable extends LivewireTableComponent
{
    protected $model = FavouriteCompany::class;
    public function configure(): void
    {
        $this->setPrimaryKey('id');

        $this->setDefaultSort('created_at', 'desc');

        $this->setThAttributes(function (Column $column) {
            if ($column->isField('id')) {
                return [
                    'class' => 'text-center',
                ];
            }
            return [
                'class' => 'text-center',
            ];
        }
        );

        $this->setTableAttributes(
            [
                'default' => false,
                'class' => 'table table-striped',
            ]
        );

        $this->setQueryStringStatus(false);
    }

    public function columns(): array
    {
        return [
            Column::make(__('messages.user.name'), "user.first_name")
                ->sortable()
                ->searchable()
                ->view('employer.followers.table_components.name'),
            Column::make('Municipio', "user.phone")
                ->sortable()
                ->searchable()
                ->view('employer.followers.table_components.phone'),
            // Column::make(__('messages.user.email'), "user.email")
            //     ->sortable()
            //     ->searchable()
            //     ->view('employer.followers.table_components.email'),
            Column::make(__('messages.candidate.available_at'), "id")
                ->view('employer.followers.table_components.available_at')
                ->sortable(),
        ];
    }

    public function builder(): Builder
    {
        $query = FavouriteCompany::with(['user', 'user.candidate'])->where(
            'company_id',
            getLoggedInUser()->owner_id
        )->select('favourite_companies.*');

        return $query;
    }
}
