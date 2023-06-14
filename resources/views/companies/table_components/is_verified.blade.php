@if($isVerified)
    <label class="switch">
        <input type="checkbox" checked wire:click="toggleVerification({{ $companyId }}, false)">
        <span class="slider round"></span>
    </label>
@else
    <label class="switch">
        <input type="checkbox" wire:click="toggleVerification({{ $companyId }}, true)">
        <span class="slider round"></span>
    </label>
@endif
