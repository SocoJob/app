<div class="badge bg-light-success">
    {{(isset($row->salaryCurrency->currency_icon)) ? $row->salaryCurrency->currency_icon : '' }} {{ number_format($row->amount, 2) }}
</div>
