@extends('layouts.app')
@section('title')
{{ __('messages.candidates') }}
@endsection
@push('css')
{{-- <link rel="stylesheet" href="{{ asset('css/header-padding.css') }}">--}}
@endpush
@section('content')
<div class="container-fluid">
    <div class="d-flex flex-column ">
        @include('flash::message')
        <livewire:candidate-table />
    </div>
</div>
{{Form::hidden('candidateData',true,['id'=>'indexCandidateData'])}}

<script>
    document.addEventListener('livewire:load', function() {
        console.log("notificacion")
        Livewire.on('verificationToggled', function(message) {
            displaySuccessMessage(message);
        });
    });
</script>
@endsection


