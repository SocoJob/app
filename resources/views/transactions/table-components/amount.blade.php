@if($row->owner != null && $row->owner->plan_currency != null &&
                    $row->owner->plan_currency->salary_currency != null)

    {{ $row->owner->plan_currency->salary_currency->currency_icon }}{{ $row->amount }}
@else
   $ {{ number_format($row->amount, 2) }}
@endif
