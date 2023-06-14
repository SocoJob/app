<?php

namespace App\Http\Livewire;

use App\Models\Skill;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Rappasoft\LaravelLivewireTables\Views\Column;
use App\Models\Candidate;
use Rappasoft\LaravelLivewireTables\Views\Columns\BooleanColumn;
use Rappasoft\LaravelLivewireTables\Views\Filters\MultiSelectFilter;
use Rappasoft\LaravelLivewireTables\Views\Filters\SelectFilter;
use Illuminate\Support\Facades\JavaScript;

class CandidateTable extends LivewireTableComponent
{
    /**
     * @var string
     */
    protected $model = Candidate::class;

    /**
     * @var bool
     */
    public $showButtonOnHeader = true;

    /**
     * @var string
     */
    public $buttonComponent = 'candidates.table-components.add_button';

    public function configure(): void
    {
        $this->setPrimaryKey('id');

        $this->setDefaultSort('created_at', 'desc');

        $this->setTableAttributes([
            'default'   =>  false,
            'class'   => 'table table-striped',
        ]);

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
            return [];
        });

        $this->setFilterPillsStatus(false);

        $this->setQueryStringStatus(false);
    }

    /**
     * @return array
     */
    public function columns(): array
    {
        return [
            Column::make(__('messages.company.candidate_name'), "user.first_name")
                ->sortable()
                ->searchable()
                ->view('candidates.table-components.name_email'),
            Column::make(__('messages.candidate.available_at'), "immediate_available")
                ->view('candidates.table-components.available'),
            Column::make(__('messages.company.email_verified'), "user.email_verified_at")
                ->view('candidates.table-components.email_verified'),
            Column::make(__('messages.common.status'), "user.is_active")
                ->view('candidates.table-components.status'),
            // Column::make('Verificado','user.is_verified')
            //     ->view('candidates.table-components.is_verified'),
            Column::make(__('Verificado'), 'user.is_verified')
                ->format(function ($value, $row) {
                    return view('candidates.table-components.is_verified', ['candidateId' => $row->id, 'isVerified' => $value]);
                }),
            Column::make(__('messages.common.last_change_by'), "last_change")
                ->view('candidates.table-components.last_change'),
            Column::make(__('messages.common.action'), "id")
                ->view('candidates.table-components.action_button'),
        ];
    }

    public function toggleVerification($candidateId, $newValue)
    {
        $candidate = Candidate::findOrFail($candidateId);
        $candidate->user->is_verified = $newValue;
        $candidate->user->save();
        $this->emit('verificationToggled','Se actualizó correctamente');
        
    }
    public function builder(): Builder
    {
        return Candidate::with('user.candidateSkill', 'admin')->select('candidates.*');
    }

    /**
     * @return array
     */
    public function filters(): array
    {
        return [
            //            MultiSelectFilter::make('Skills')
            //                        ->options(
            //                            Skill::query()
            //                                ->orderBy('name')
            //                                ->get()
            //                                ->keyBy('id')
            //                                ->map(
            //                                    function ($skill) {
            //                                        return $skill->name;
            //                                    }
            //                                )
            //                                ->toArray()
            //                        )
            //                        ->filter(
            //                            function ($value) {
            //                                Skill::whereHas('candidate', function ($query) use ($value) {
            //                                    dd($query->where('users.id', $value)->get());
            //                                });
            ////                                dd($builder->where('user_id','=', 'user.candidateSkill.pivot.user_id')->get());
            ////                                return $builder->where('user_id', 'user.candidateSkill.user_id')->get();
            //                            },
            //                        ),
            SelectFilter::make(__('messages.filter_name.immediate'))
                ->options([
                    '' => (__('messages.common.all')),
                    1  => (__('messages.candidate.immediate_available')),
                    2  => (__('messages.candidate.not_immediate_available')),
                ])
                ->filter(
                    function (Builder $builder, string $value) {
                        if ($value == 1) {
                            $builder->where('immediate_available', '=', 1);
                        } else {
                            $builder->where('immediate_available', '=', 0);
                        }
                    }
                ),

            SelectFilter::make(__('messages.filter_name.status'))
                ->options([
                    '' => (__('messages.common.all')),
                    1  => (__('messages.common.active')),
                    2  => (__('messages.common.de_active')),
                ])
                ->filter(
                    function (Builder $builder, string $value) {
                        if ($value == 1) {
                            $builder->where('users.is_active', '=', 1);
                        } else {
                            $builder->where('users.is_active', '=', 0);
                        }
                    }
                ),
        ];
    }
    
}
