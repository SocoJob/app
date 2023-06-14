@if($isVerified)
    <label class="switch">
        <input type="checkbox" checked wire:click="toggleVerification({{ $candidateId }}, false)">
        <span class="slider round"></span>
    </label>
@else
    <label class="switch">
        <input type="checkbox" wire:click="toggleVerification({{ $candidateId }}, true)">
        <span class="slider round"></span>
    </label>
@endif
