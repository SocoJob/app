    <!-- {{$row->job->currency->currency_icon}} -->
    {{$row->candidate->user->country->name}}@isset($row->candidate->user->state->name), {{$row->candidate->user->state->name}}@endisset
@isset($row->candidate->user->city->name), {{$row->candidate->user->city->name}}@endisset
