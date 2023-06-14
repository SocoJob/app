@php
$subscription = Auth::user()->subscriptions()->active()->first();
@endphp

@if(isset($subscription)  and $subscription->current_period_end > \Carbon\Carbon::now())
<a type="button" class="btn btn-primary pt-3 mt-1" href="{{ route('job.create') }}">
    {{ __('messages.common.add') }}
</a>
@else
<a href="{{ route('manage-subscription.index') }}" class="btn btn-success pt-2 mt-1" >Suscríbete</a>
@endif