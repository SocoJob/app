<?php

namespace App\Http\Livewire;

use Rappasoft\LaravelLivewireTables\DataTableComponent;
use Rappasoft\LaravelLivewireTables\Views\Column;
use App\Models\NewsLetter;
use App\Models\Subscription;
class SubscriberTable extends LivewireTableComponent
{
    protected $model = Subscription::class;

    public function configure(): void
    {
        $this->setPrimaryKey('id');

        $this->setDefaultSort('created_at', 'desc');

        $this->setTableAttributes([
            'default' => false,
            'class' => 'table table-striped',
        ]);

        $this->setThAttributes(function (Column $column) {
            return [
                'class' =>  'text-center'
            ];
        });
        $this->setTdAttributes(function (Column $column, $row, $columnIndex, $rowIndex) {
            if ($columnIndex == '2') {
                return [
                    'class' => 'text-center',
                    'width' => '15%'
                ];
            }
            return [];
        });

        $this->setQueryStringStatus(false);
    }

    public function columns(): array
    {
        return [
            Column::make("Stripe ID", "stripe_id")
                ->sortable()
                ->searchable(),
            Column::make("Plan", "name")
                ->sortable()
                ->searchable(),
            Column::make(__('messages.user.email'), "user_id")
            ->view('subscribers.table-components.user'),
            Column::make("Inicio", "current_period_start")
            ->sortable()
            ->searchable()->view('subscribers.table-components.current_period_start'),
            Column::make("Fin", "current_period_end")
            ->sortable()
            ->searchable()->view('subscribers.table-components.current_period_end'),
            // Column::make(__('messages.common.created_date'), "created_at")
            //     ->sortable()
            //     ->view('subscribers.table-components.created_at'),
            // Column::make(__('messages.common.action'), "id")
            //     ->view('subscribers.table-components.action_button'),
        ];
    }
}
